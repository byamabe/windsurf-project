declare module '#imports' {
  export { 
    useSupabaseClient,
    useSupabaseUser
  } from '@nuxtjs/supabase/dist/runtime/composables'
  
  export { 
    useRouter,
    useRoute,
    defineNuxtRouteMiddleware,
    navigateTo
  } from '#app'
}

declare module '#app' {
  interface PageMeta {
    auth?: boolean
    admin?: boolean
  }
}
