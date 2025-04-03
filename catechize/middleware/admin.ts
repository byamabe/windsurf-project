export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  const { hasPermission, getUserPermissions } = usePermissions()
  
  try {
    // Check if user is authenticated
    if (!user.value) {
      return navigateTo('/auth/login')
    }

    // Check required permissions based on route
    const routeToPermissionMap: Record<string, string> = {
      '/admin': 'manage:roles',  // Admin dashboard requires role management
      '/admin/podcasts': 'create:any_content',
      '/admin/episodes': 'create:any_content',
      '/admin/articles': 'create:any_content',
      '/admin/resources': 'create:any_content',
      '/admin/categories': 'create:any_content',
      '/admin/users': 'manage:users',
      '/admin/test': 'manage:roles',  // Test pages require highest privilege
      '/admin/test/media-player': 'manage:roles',
      '/admin/test/auth': 'manage:roles'
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
    console.log('Checking permission:', requiredPermission, 'for user:', user.value?.email)
    const permissions = await getUserPermissions()
    console.log('User permissions:', permissions)
    const hasAccess = permissions.includes(requiredPermission)
    
    if (!hasAccess) {
      console.error('User does not have required permission:', requiredPermission)
      return navigateTo('/')
    }
  } catch (err) {
    console.error('Admin middleware error:', err)
    return navigateTo('/')
  }
})
