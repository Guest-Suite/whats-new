export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],

  nitro: {
    preset: 'netlify',
  },

  runtimeConfig: {
    notionApiKey: process.env.NOTION_API_KEY,
    notionDatabaseId: process.env.NOTION_DATABASE_ID,
  },

  routeRules: {
    '/': { isr: 60 },
  },
})
