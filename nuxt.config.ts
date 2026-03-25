export default defineNuxtConfig({
  app: {
    head: {
      title: 'Quoi de neuf ? - Guest Suite',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },

  runtimeConfig: {
    notionApiKey: process.env.NOTION_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    generateSecret: process.env.GENERATE_SECRET,
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
  },

  devServer: {
    port: 3005,
  },
})
