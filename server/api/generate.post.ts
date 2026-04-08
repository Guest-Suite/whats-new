import { writeFileSync, mkdirSync, renameSync } from 'node:fs'
import { join } from 'node:path'
import { Client } from '@notionhq/client'
import Anthropic from '@anthropic-ai/sdk'
import { fetchPublishedItems } from '../utils/fetchPublishedItems'

const DB_ID = '134b85ab6efc802c9f61c8f2aa250968'
const PROMPT_PAGE_ID = '32eb85ab6efc81098ebeeadfca7afbf9'

// Rate limiting: max 5 requests per minute
const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT_WINDOW = 60_000
const RATE_LIMIT_MAX = 5

async function getPromptFromNotion(notion: Client): Promise<string> {
  const blocks = await notion.blocks.children.list({ block_id: PROMPT_PAGE_ID })
  return blocks.results
    .map((block: any) => {
      if (block.type === 'paragraph') {
        return block.paragraph.rich_text.map((rt: any) => rt.plain_text).join('')
      }
      if (block.type === 'heading_1') {
        return `# ${block.heading_1.rich_text.map((rt: any) => rt.plain_text).join('')}`
      }
      if (block.type === 'heading_2') {
        return `## ${block.heading_2.rich_text.map((rt: any) => rt.plain_text).join('')}`
      }
      if (block.type === 'heading_3') {
        return `### ${block.heading_3.rich_text.map((rt: any) => rt.plain_text).join('')}`
      }
      if (block.type === 'bulleted_list_item') {
        return `- ${block.bulleted_list_item.rich_text.map((rt: any) => rt.plain_text).join('')}`
      }
      if (block.type === 'code') {
        return `\`\`\`\n${block.code.rich_text.map((rt: any) => rt.plain_text).join('')}\n\`\`\``
      }
      if (block.type === 'divider') {
        return '---'
      }
      return ''
    })
    .filter(Boolean)
    .join('\n')
}

function extractRichText(prop: any): string {
  return (prop?.rich_text ?? []).map((rt: any) => rt.plain_text).join('')
}

async function generateContent(
  anthropic: Anthropic,
  systemPrompt: string,
  fonctionnalites: string,
  bugs: string,
): Promise<{
  titre: string
  description: string
  corrections: string
  tags: string[]
  cta_texte: string
  cta_lien: string
}> {
  const userMessage = `Voici les inputs pour cette release :

## Listing des fonctionnalites
${fonctionnalites || '(aucune fonctionnalite listee)'}

## Resolution de bugs
${bugs || '(aucun bug corrige)'}

Genere le contenu "Quoi de neuf" au format JSON demande.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('')

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Claude n\'a pas retourne de JSON valide')
  }

  const parsed = JSON.parse(jsonMatch[0])

  if (typeof parsed.titre !== 'string' || !parsed.titre.trim()) {
    throw new Error('Champ "titre" manquant ou invalide dans la réponse Claude')
  }
  if (typeof parsed.description !== 'string') {
    throw new Error('Champ "description" manquant ou invalide dans la réponse Claude')
  }
  if (!Array.isArray(parsed.tags)) {
    parsed.tags = []
  }

  return {
    titre: parsed.titre.slice(0, 500),
    description: (parsed.description ?? '').slice(0, 2000),
    corrections: (parsed.corrections ?? '').slice(0, 2000),
    tags: parsed.tags.filter((t: unknown) => typeof t === 'string').slice(0, 10),
    cta_texte: (parsed.cta_texte ?? '').slice(0, 200),
    cta_lien: (parsed.cta_lien ?? '').slice(0, 500),
  }
}

function toRichText(text: string) {
  if (!text) return []
  return [{ text: { content: text } }]
}

async function refreshJsonCache(notionKey: string): Promise<void> {
  const items = await fetchPublishedItems(notionKey)
  const appHome = process.env.APP_HOME || process.cwd()
  const dataDir = join(appHome, process.env.DATA_DIR || 'server/data')
  try { mkdirSync(dataDir, { recursive: true }) } catch {}
  const filePath = join(dataDir, 'changelog.json')
  const tmpPath = `${filePath}.tmp`
  writeFileSync(tmpPath, JSON.stringify(items, null, 2))
  renameSync(tmpPath, filePath)
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  // Auth: require Bearer token matching GENERATE_SECRET
  const secret = config.generateSecret
  if (secret) {
    const auth = getHeader(event, 'authorization')
    if (!auth || auth !== `Bearer ${secret}`) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }
  }

  // Rate limiting by IP
  const ip = getHeader(event, 'x-forwarded-for') || getRequestIP(event) || 'unknown'
  const now = Date.now()
  const timestamps = rateLimitMap.get(ip)?.filter(t => now - t < RATE_LIMIT_WINDOW) ?? []
  if (timestamps.length >= RATE_LIMIT_MAX) {
    throw createError({ statusCode: 429, message: 'Too many requests. Try again later.' })
  }
  timestamps.push(now)
  rateLimitMap.set(ip, timestamps)

  const notionKey = config.notionApiKey
  const anthropicKey = config.anthropicApiKey

  if (!notionKey || !anthropicKey) {
    throw createError({
      statusCode: 500,
      message: 'NOTION_API_KEY et ANTHROPIC_API_KEY sont requises',
    })
  }

  const notion = new Client({ auth: notionKey })
  const anthropic = new Anthropic({ apiKey: anthropicKey })

  // Optional: n8n can pass a specific page ID to generate for
  const body = await readBody(event).catch(() => ({}))
  const targetPageId = typeof body?.pageId === 'string' ? body.pageId.trim() : null

  // 1. Lire le prompt depuis Notion
  const systemPrompt = await getPromptFromNotion(notion)

  // 2. Query les entrees "A generer" (or a specific page if pageId is provided)
  let pages: any[]

  if (targetPageId) {
    const page = await notion.pages.retrieve({ page_id: targetPageId })
    pages = [page]
  }
  else {
    const response = await notion.databases.query({
      database_id: DB_ID,
      filter: {
        property: 'Statut Quoi de neuf',
        select: { equals: 'À générer' },
      },
    })
    pages = response.results
  }

  if (!pages.length) {
    refreshJsonCache(notionKey).catch((err) => {
      console.error('[generate] Échec du refresh JSON cache:', err)
    })
    return { generated: 0, message: 'Aucune entree a generer' }
  }

  const results = []

  for (const page of pages) {
    const props = (page as any).properties
    const nom = props.Nom?.title?.[0]?.plain_text || 'Sans nom'
    const fonctionnalites = extractRichText(props['Listing des fonctionnalités'])
    const bugs = extractRichText(props['Résolution de Bugs'])

    if (!fonctionnalites && !bugs) {
      results.push({ id: page.id, nom, status: 'skipped', reason: 'Aucun input' })
      continue
    }

    try {
      const content = await generateContent(anthropic, systemPrompt, fonctionnalites, bugs)

      await notion.pages.update({
        page_id: page.id,
        properties: {
          'Titre Quoi de neuf': { rich_text: toRichText(content.titre) },
          'Description Quoi de neuf': { rich_text: toRichText(content.description) },
          'Corrections Quoi de neuf': { rich_text: toRichText(content.corrections) },
          'Tags Quoi de neuf': {
            multi_select: content.tags.map((tag) => ({ name: tag })),
          },
          'CTA Texte': { rich_text: toRichText(content.cta_texte) },
          'CTA Lien': { url: content.cta_lien && /^https?:\/\//.test(content.cta_lien) ? content.cta_lien : null },
          'Statut Quoi de neuf': { select: { name: 'Draft' } },
        },
      })

      results.push({ id: page.id, nom, status: 'generated', content })

      const slackWebhookUrl = config.slackWebhookUrl
      if (slackWebhookUrl) {
        const notionUrl = `https://www.notion.so/guest-suite/${page.id.replace(/-/g, '')}`
        await fetch(slackWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `:sparkles: Le wording *Quoi de neuf* pour *${nom}* a été généré. Merci de le vérifier : ${notionUrl}`,
          }),
        }).catch(() => {})
      }
    }
    catch (err: any) {
      results.push({ id: page.id, nom, status: 'error', error: err.message })
    }
  }

  // Refresh the JSON cache with the latest published items
  refreshJsonCache(notionKey).catch((err) => {
    console.error('[generate] Échec du refresh JSON cache:', err)
  })

  return {
    generated: results.filter((r) => r.status === 'generated').length,
    total: pages.length,
    results,
  }
})
