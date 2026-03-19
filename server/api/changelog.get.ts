import { Client } from '@notionhq/client'

const MOCK_DATA = [
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
  },
  {
    id: 'mock-3',
    titre: 'Reply IA : des réponses encore plus naturelles',
    description: 'Notre modèle d\'IA pour la réponse aux avis a été mis à jour pour générer des réponses plus fluides et naturelles. Fini les formulations répétitives — chaque réponse s\'adapte mieux au ton de l\'avis client.',
    date: '2026-02-10',
    media: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',
    ctaTexte: 'Répondre à mes avis',
    ctaLien: '/reviews',
    tags: ['Amélioration'],
    audience: 'Public',
    corrections: [
      'Reply IA - Les réponses ne respectaient pas toujours le ton configuré',
      'Avis Google - Bug sur les réponses aux avis en attente',
      'Réputation - Le filtre par note ne fonctionnait pas après une réponse',
    ],
  },
  {
    id: 'mock-4',
    titre: 'Campagnes : configurez et suivez vos performances',
    description: 'Accédez à la configuration complète de vos campagnes et à votre tableau de bord de performances. Suivez vos envois, analysez vos résultats et optimisez votre collecte d\'avis en temps réel.',
    date: '2026-02-03',
    media: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    ctaTexte: 'Voir mes campagnes',
    ctaLien: '/collect/campaigns',
    tags: ['Nouveau'],
    audience: 'Public',
    corrections: [
      'Campagnes - Correction d\'un bug sur l\'envoi des campagnes SMS',
    ],
  },
  {
    id: 'mock-5',
    titre: 'Retrouvez vos enquêtes par nom d\'établissement',
    description: 'Gagnez du temps dans vos recherches : il est désormais possible de rechercher une enquête directement par nom d\'établissement.',
    date: '2026-02-03',
    media: null,
    ctaTexte: 'Accéder aux enquêtes',
    ctaLien: '/collect',
    tags: ['Amélioration'],
    audience: 'Public',
    corrections: [],
  },
]

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const apiKey = config.notionApiKey || process.env.NOTION_API_KEY
  const dbId = config.notionDatabaseId || process.env.NOTION_DATABASE_ID

  if (!apiKey || !dbId) {
    return [{ id: 'debug-no-env', titre: `NO ENV: apiKey=${!!apiKey} dbId=${!!dbId}`, description: '', date: null, media: null, ctaTexte: null, ctaLien: null, tags: [], corrections: [] }]
  }

  try {
    const notion = new Client({ auth: apiKey })

    const response = await notion.databases.query({
      database_id: dbId,
      filter: {
        property: 'Statut Quoi de neuf',
        select: { equals: 'Publié' },
      },
      sorts: [{ property: 'Date', direction: 'descending' }],
    })

    const results = response.results.map((page: any) => {
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
      }
    })

    return results.length ? results : MOCK_DATA
  }
  catch (e: any) {
    return [{ id: 'debug-error', titre: `ERROR: ${e?.message}`, description: '', date: null, media: null, ctaTexte: null, ctaLien: null, tags: [], corrections: [] }]
  }
})
