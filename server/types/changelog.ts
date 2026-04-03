export interface ChangelogItem {
  id: string
  titre: string
  description: string
  date: string | null
  media: string | null
  ctaTexte: string | null
  ctaLien: string | null
  tags: string[]
  audience?: string   // Optional: not mapped from Notion, not rendered by ChangelogEntry.vue
  corrections: string[]
  autresAjouts: string[]
}
