export default defineNuxtConfig({
  app: {
    head: {
      title: 'Guest Suite - Quoi de neuf ? Nouvelles fonctionnalités, améliorations et mises à jour',
      htmlAttrs: { lang: 'fr' },
      meta: [
        { name: 'description', content: 'Découvrez les dernières nouveautés Guest Suite : nouvelles fonctionnalités, améliorations produit et corrections. Suivez l\'évolution de la plateforme en temps réel.' },
        { property: 'og:title', content: 'Guest Suite - Quoi de neuf ? Nouvelles fonctionnalités, améliorations et mises à jour' },
        { property: 'og:description', content: 'Découvrez les dernières nouveautés Guest Suite : nouvelles fonctionnalités, améliorations produit et corrections. Suivez l\'évolution de la plateforme en temps réel.' },
        { property: 'og:url', content: process.env.NUXT_PUBLIC_SITE_URL || 'https://news.guest-suite.com/' },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: `${process.env.NUXT_PUBLIC_SITE_URL || 'https://news.guest-suite.com'}/og-image.png` },
        { property: 'og:image:type', content: 'image/png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },

  runtimeConfig: {
    notionApiKey: process.env.NOTION_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    generateSecret: process.env.GENERATE_SECRET,
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
  },

  routeRules: {
    '/**': {
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      },
    },
    '/api/changelog.json': { cors: true },
  },

  devServer: {
    host: '0.0.0.0',
    port: 3005,
  },
})
