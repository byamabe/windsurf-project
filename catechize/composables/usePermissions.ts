import { useSupabaseClient, useSupabaseUser } from '#imports'
import type { Database, Permission, Role, UserSubscription } from '~/types/supabase'

interface RolePermissionWithData {
  permission: Permission
  role: {
    user_role: {
      user_id: string
    }
  }
}

interface UserRoleWithRole {
  role: Role
}

export const usePermissions = () => {
  const client = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  const getUserPermissions = async () => {
    if (!user.value) return []

    const { data, error } = await client
      .from('role_permissions')
      .select(`
        permission:permissions!inner (
          id,
          name
        ),
        role:roles!inner (
          user_role:user_roles!inner (
            user_id
          )
        )
      `)
      .eq('role.user_role.user_id', user.value.id) as { data: RolePermissionWithData[] | null; error: any }

    if (error) {
      console.error('Error fetching user permissions:', error)
      return []
    }

    return (data || []).map(p => p.permission.name)
  }

  const getUserRoles = async () => {
    if (!user.value) return []

    const { data, error } = await client
      .from('user_roles')
      .select(`
        role:roles!inner (
          id,
          name,
          description,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', user.value.id) as { data: UserRoleWithRole[] | null; error: any }

    if (error) {
      console.error('Error fetching user roles:', error)
      return []
    }

    return (data || []).map(r => r.role)
  }

  const getUserSubscription = async () => {
    if (!user.value) return null

    const { data, error } = await client
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.value.id)
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user subscription:', error)
      return null
    }

    return data as UserSubscription | null
  }

  const hasRole = async (role: string) => {
    const roles = await getUserRoles()
    return roles.some(r => r.name === role)
  }

  const hasPermission = async (permission: string) => {
    const permissions = await getUserPermissions()
    return permissions.includes(permission)
  }

  const isSubscriptionActive = async () => {
    const subscription = await getUserSubscription()
    return subscription?.is_active || false
  }

  const getSubscriptionTier = async () => {
    const subscription = await getUserSubscription()
    return subscription?.tier || 'free'
  }

  return {
    getUserPermissions,
    getUserRoles,
    getUserSubscription,
    hasRole,
    hasPermission,
    isSubscriptionActive,
    getSubscriptionTier,
  }
}
