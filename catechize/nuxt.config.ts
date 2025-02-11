// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/supabase'
  ],
  typescript: {
    strict: true,
    typeCheck: true
  },
  supabase: {
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/confirm',
      exclude: ['/*'],
    },
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    cookieOptions: {
      domain: process.env.NODE_ENV === 'development' ? 'localhost.localtest.me' : undefined,
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    },
    clientOptions: {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  },
  imports: {
    presets: [
      {
        from: 'pinia',
        imports: ['defineStore', 'acceptHMRUpdate']
      }
    ]
  },
  app: {
    head: {
      title: 'Catechize.org',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'A Lutheran media hub for organizing and hosting podcasts and other media content' }
      ]
    }
  }
})
