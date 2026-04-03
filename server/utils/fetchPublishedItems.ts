import { Client } from '@notionhq/client'
import type { ChangelogItem } from '../types/changelog'

const DB_ID = '134b85ab6efc802c9f61c8f2aa250968'

export async function fetchPublishedItems(apiKey: string): Promise<ChangelogItem[]> {
  if (!apiKey) {
    console.warn('[fetchPublishedItems] NOTION_API_KEY manquante')
    return []
  }

  const notion = new Client({ auth: apiKey })

  const response = await notion.databases.query({
    database_id: DB_ID,
    filter: {
      property: 'Statut Quoi de neuf',
      select: { equals: 'Publié' },
    },
    sorts: [{ property: 'Date', direction: 'descending' }],
  })

  return response.results.map((page: any) => {
    const props = page.properties
    const titreQdn = (props['Titre Quoi de neuf']?.rich_text ?? [])
      .map((rt: any) => rt.plain_text).join('')
    return {
      id: page.id,
      titre: titreQdn || props.Nom?.title?.[0]?.plain_text || '',
      description: (props['Description Quoi de neuf']?.rich_text ?? [])
        .map((rt: any) => rt.plain_text).join(''),
      date: props.Date?.date?.start ?? null,
      media: props['Média']?.url ?? null,
      ctaTexte: (props['CTA Texte']?.rich_text ?? [])
        .map((rt: any) => rt.plain_text).join('') || null,
      ctaLien: props['CTA Lien']?.url ?? null,
      tags: props['Tags Quoi de neuf']?.multi_select?.map((t: any) => t.name) ?? [],
      corrections: (props['Corrections Quoi de neuf']?.rich_text ?? [])
        .map((rt: any) => rt.plain_text)
        .join('')
        .split('\n')
        .filter((l: string) => l.trim()),
      autresAjouts: (props['Autres ajouts Quoi de neuf']?.rich_text ?? [])
        .map((rt: any) => rt.plain_text)
        .join('')
        .split('\n')
        .filter((l: string) => l.trim()),
    } satisfies ChangelogItem
  })
}
