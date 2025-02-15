import { defineNuxtRouteMiddleware, navigateTo } from '#imports'
import { useSupabaseClient, useSupabaseUser } from '#imports'

export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()

  // Check if route requires authentication
  if (to.meta.auth) {
    if (!user.value) {
      return navigateTo('/auth/login')
    }

    // Check for admin routes
    if (to.meta.admin) {
      // Get user roles
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role:roles(name)')
        .eq('user_id', user.value.id)

      const isAdmin = roles?.some((role: any) => role.role?.name === 'admin')
      if (!isAdmin) {
        return navigateTo('/')
      }
    }
  }
})
