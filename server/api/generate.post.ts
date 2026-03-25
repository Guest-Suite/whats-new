import { Client } from '@notionhq/client'
import Anthropic from '@anthropic-ai/sdk'

const DB_ID = '134b85ab6efc802c9f61c8f2aa250968'
const PROMPT_PAGE_ID = '32eb85ab6efc81098ebeeadfca7afbf9'

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
  autres_ajouts: string
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

  return JSON.parse(jsonMatch[0])
}

function toRichText(text: string) {
  if (!text) return []
  return [{ text: { content: text } }]
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const notionKey = config.notionApiKey || process.env.NOTION_API_KEY
  const anthropicKey = config.anthropicApiKey || process.env.ANTHROPIC_API_KEY

  if (!notionKey || !anthropicKey) {
    throw createError({
      statusCode: 500,
      message: 'NOTION_API_KEY et ANTHROPIC_API_KEY sont requises',
    })
  }

  const notion = new Client({ auth: notionKey })
  const anthropic = new Anthropic({ apiKey: anthropicKey })

  // 1. Lire le prompt depuis Notion
  const systemPrompt = await getPromptFromNotion(notion)

  // 2. Query les entrees "A generer"
  const response = await notion.databases.query({
    database_id: DB_ID,
    filter: {
      property: 'Statut Quoi de neuf',
      select: { equals: 'À générer' },
    },
  })

  if (!response.results.length) {
    return { generated: 0, message: 'Aucune entree a generer' }
  }

  const results = []

  for (const page of response.results) {
    const props = (page as any).properties
    const nom = props.Nom?.title?.[0]?.plain_text || 'Sans nom'
    const fonctionnalites = extractRichText(props['Listing des fonctionnalités'])
    const bugs = extractRichText(props['Résolution de Bugs'])

    if (!fonctionnalites && !bugs) {
      results.push({ id: page.id, nom, status: 'skipped', reason: 'Aucun input' })
      continue
    }

    try {
      // 3. Generer le contenu via Claude
      const content = await generateContent(anthropic, systemPrompt, fonctionnalites, bugs)

      // 4. Mettre a jour la page Notion
      await notion.pages.update({
        page_id: page.id,
        properties: {
          'Titre Quoi de neuf': { rich_text: toRichText(content.titre) },
          'Description Quoi de neuf': { rich_text: toRichText(content.description) },
          'Autres ajouts Quoi de neuf': { rich_text: toRichText(content.autres_ajouts) },
          'Corrections Quoi de neuf': { rich_text: toRichText(content.corrections) },
          'Tags Quoi de neuf': {
            multi_select: content.tags.map((tag) => ({ name: tag })),
          },
          'CTA Texte': { rich_text: toRichText(content.cta_texte) },
          'CTA Lien': { url: content.cta_lien || null },
          'Statut Quoi de neuf': { select: { name: 'Draft' } },
        },
      })

      results.push({ id: page.id, nom, status: 'generated', content })
    }
    catch (err: any) {
      results.push({ id: page.id, nom, status: 'error', error: err.message })
    }
  }

  return {
    generated: results.filter((r) => r.status === 'generated').length,
    total: response.results.length,
    results,
  }
})
