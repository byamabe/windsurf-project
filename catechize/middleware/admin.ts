export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  const { hasPermission } = usePermissions()
  
  try {
    // Check if user is authenticated
    if (!user.value) {
      return navigateTo('/auth/login')
    }

    // Check required permissions based on route
    const routeToPermissionMap: Record<string, string> = {
      '/admin': 'system.manage',
      '/admin/podcasts': 'content.create',
      '/admin/articles': 'content.create',
      '/admin/resources': 'content.create',
      '/admin/categories': 'categories.create',
      '/admin/users': 'users.view'
    }

    // Get the most specific permission required for this route
    const requiredPermission = Object.entries(routeToPermissionMap)
      .filter(([route]) => to.path.startsWith(route))
      .sort((a, b) => b[0].length - a[0].length)[0]?.[1]

    if (!requiredPermission) {
      console.error('No permission mapping found for route:', to.path)
      return navigateTo('/')
    }

    // Check if user has required permission
    const hasAccess = await hasPermission(requiredPermission)
    
    if (!hasAccess) {
      console.error('User does not have required permission:', requiredPermission)
      return navigateTo('/')
    }
  } catch (err) {
    console.error('Admin middleware error:', err)
    return navigateTo('/')
  }
})
