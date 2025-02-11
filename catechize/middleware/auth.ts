import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import type { Database, Role } from '~/types/supabase'

interface UserRoleWithRole {
  role: Role
}

export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  const client = useSupabaseClient<Database>()

  // Allow access to public pages
  const publicPages = ['/auth/login', '/auth/signup', '/']
  if (publicPages.includes(to.path)) {
    return
  }

  try {
    // Try to refresh the session
    const { data: { session }, error } = await client.auth.getSession()
    
    // If no session, redirect to login
    if (!session) {
      return navigateTo('/auth/login')
    }

    // If error refreshing session, redirect to login
    if (error) {
      console.error('Session refresh error:', error)
      return navigateTo('/auth/login')
    }

    // Check role-based access for protected routes
    if (to.path.startsWith('/admin')) {
      // Check if user is admin
      const { data: roles } = await client
        .from('user_roles')
        .select(`
          role:roles!inner (
            id,
            name
          )
        `)
        .eq('user_id', session.user.id) as { data: UserRoleWithRole[] | null; error: any }

      const isAdmin = roles?.some(r => r.role.name === 'admin')
      if (!isAdmin) {
        console.warn('Unauthorized access attempt to admin area')
        return navigateTo('/')
      }
    }

    // Check subscription-based access for premium features
    if (to.meta.requiresSubscription) {
      const { data: subscription } = await client
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single()

      if (!subscription) {
        console.warn('Subscription required for this feature')
        return navigateTo('/subscription')
      }
    }

  } catch (err) {
    console.error('Auth middleware error:', err)
    return navigateTo('/auth/login')
  }
})
