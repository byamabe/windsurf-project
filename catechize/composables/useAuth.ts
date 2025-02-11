import { useSupabaseClient, useSupabaseUser } from '#imports'
import type { Database } from '~/types/supabase'

interface UserRoleWithRole {
  role: {
    id: string
    name: string
    description: string | null
  }
}

export const useAuth = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  const isAdmin = async () => {
    if (!user.value) return false

    const { data: userRoles, error } = await supabase
      .from('user_roles')
      .select(`
        role:roles!inner (
          id,
          name,
          description
        )
      `)
      .eq('user_id', user.value.id) as { data: UserRoleWithRole[] | null, error: any }

    if (error) {
      console.error('Error checking admin status:', error)
      return false
    }

    return userRoles?.some(role => role.role.name === 'admin') || false
  }

  return {
    isAdmin
  }
}
