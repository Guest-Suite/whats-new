export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],

  runtimeConfig: {
    notionApiKey: process.env.NOTION_API_KEY,
  },

  devServer: {
    port: 3005,
  },
})
