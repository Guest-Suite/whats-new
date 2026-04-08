import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import type { ChangelogItem } from '../types/changelog'

const appHome = process.env.APP_HOME || process.cwd()
const dataDir = join(appHome, process.env.DATA_DIR || 'server/data')
const filePath = join(dataDir, 'changelog.json')

const MOCK_DATA: ChangelogItem[] = [
  {
    id: 'mock-1',
    titre: 'Filtrez par groupe d\'établissements sur toute la plateforme',
    description: 'Vous gérez plusieurs établissements ? Filtrez désormais par groupe sur l\'ensemble des modules : Enquêtes, Réputation, Présence, Audience, Campagnes et Administration. Une vue centralisée pour piloter votre activité encore plus efficacement.',
    date: '2026-02-24',
    media: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    ctaTexte: 'Découvrir',
    ctaLien: '/reviews',
    tags: ['Nouveau'],
    audience: 'Public',
    corrections: [],
    autresAjouts: [],
  },
  {
    id: 'mock-2',
    titre: 'Connectez Trustpilot directement depuis Guest Suite',
    description: 'Reprenez le contrôle de votre réputation Trustpilot ! Configurez la centralisation de vos avis Trustpilot directement depuis la plateforme, en quelques clics, sans intervention technique.',
    date: '2026-02-24',
    media: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
    ctaTexte: 'Configurer Trustpilot',
    ctaLien: '/reviews',
    tags: ['Nouveau', 'Intégration'],
    audience: 'Public',
    corrections: [],
    autresAjouts: [],
  },
  {
    id: 'mock-3',
    titre: 'Reply IA : des réponses encore plus naturelles',
    description: 'Notre modèle d\'IA pour la réponse aux avis a été mis à jour pour générer des réponses plus fluides et naturelles.',
    date: '2026-02-10',
    media: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',
    ctaTexte: 'Répondre à mes avis',
    ctaLien: '/reviews',
    tags: ['Amélioration'],
    audience: 'Public',
    corrections: [],
    autresAjouts: [],
  },
]

export default defineEventHandler((): ChangelogItem[] => {
  if (!existsSync(filePath)) {
    return process.env.NODE_ENV !== 'production' ? MOCK_DATA : []
  }

  try {
    const raw = readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as ChangelogItem[]
  }
  catch {
    return process.env.NODE_ENV !== 'production' ? MOCK_DATA : []
  }
})
