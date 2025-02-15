import type { SupabaseClient } from '@supabase/supabase-js'
import type { Ref } from 'vue'
import type { Router } from 'vue-router'
import type { User } from './database'

declare module '#app' {
  interface NuxtApp {
    $supabase: SupabaseClient
  }
}

// Extend the Nuxt runtime config
declare module '@nuxt/schema' {
  interface RuntimeConfig {
    public: {
      supabaseUrl: string
      supabaseKey: string
    }
  }
}

// Add types for composables
declare module '#imports' {
  function useSupabaseClient(): SupabaseClient
  function useSupabaseUser(): Ref<User | null>
  function useRouter(): Router
}

// Add global type for Database
declare global {
  type DbResult<T> = T extends PromiseLike<infer U> ? U : never
  type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? U : never
  type DbResultErr = PostgrestError
}
