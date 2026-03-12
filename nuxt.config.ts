export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss', '@netlify/nuxt'],

  runtimeConfig: {
    notionApiKey: process.env.NOTION_API_KEY,
    notionDatabaseId: process.env.NOTION_DATABASE_ID,
  },

  routeRules: {
    '/': { isr: 60 },
  },
})
