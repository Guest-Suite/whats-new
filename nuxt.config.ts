export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],

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
  },

  devServer: {
    port: 3005,
  },
})
