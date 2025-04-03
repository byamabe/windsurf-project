<template>
  <!-- ... -->
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  Dialog,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  TransitionChild,
  TransitionRoot
} from '@headlessui/vue'
import {
  Bars3Icon,
  ChevronDownIcon,
  HomeIcon,
  MicrophoneIcon,
  DocumentTextIcon,
  BookOpenIcon,
  TagIcon,
  XMarkIcon,
  ChartBarIcon,
  PlayIcon,
  KeyIcon
} from '@heroicons/vue/24/outline'
import { useRouter, useSupabaseClient, useSupabaseUser, useRoute } from '#imports'
import Toast from '~/components/Toast.vue'

definePageMeta({
  middleware: ['auth', 'admin']
})

const router = useRouter()
const client = useSupabaseClient()
const user = useSupabaseUser()
const route = useRoute()

const sidebarOpen = ref(false)

interface NavigationItem {
  name: string
  href?: string
  icon: any
  current: boolean
  children?: {
    name: string
    href: string
    icon: any
  }[]
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon, current: false },
  { name: 'Podcasts', href: '/admin/podcasts', icon: MicrophoneIcon, current: false },
  { name: 'Articles', href: '/admin/articles', icon: DocumentTextIcon, current: false },
  { name: 'Resources', href: '/admin/resources', icon: BookOpenIcon, current: false },
  { name: 'Categories', href: '/admin/categories', icon: TagIcon, current: false },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon, current: false }
]

const userPermissions = ref<string[]>([])

watch(user, async () => {
  if (user.value) {
    try {
      console.log('Loading permissions for user:', user.value.email)
      
      // Get user roles
      const { data: rolesData, error: rolesError } = await client
        .from('user_roles')
        .select('roles (*)')
        .eq('user_id', user.value.id)

      if (rolesError) throw rolesError
      const roles = rolesData.map((r: any) => r.roles)
      console.log('User roles:', roles)

      // Get user permissions
      const { data: permissionsData, error: permissionsError } = await client
        .from('role_permissions')
        .select('permissions (name)')
        .in('role_id', roles.map(r => r.id))

      if (permissionsError) throw permissionsError
      userPermissions.value = permissionsData.map((p: any) => p.permissions.name)
      console.log('User permissions:', userPermissions.value)

      // Add Testing menu if user has manage:roles permission
      if (userPermissions.value.includes('manage:roles')) {
        console.log('User has manage:roles permission, adding Testing menu')
        const testingMenu: NavigationItem = { 
          name: 'Testing',
          icon: KeyIcon,
          current: false,
          children: [
            { name: 'Media Player', href: '/admin/test/media-player', icon: PlayIcon },
            { name: 'Authentication', href: '/admin/test/auth', icon: KeyIcon }
          ]
        }
        
        // Only add if not already in navigation
        if (!navigation.some(item => item.name === 'Testing')) {
          navigation.push(testingMenu)
          console.log('Testing menu added to navigation')
        }
      } else {
        console.log('User does not have manage:roles permission')
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  } else {
    userPermissions.value = []
    // Remove Testing menu if exists
    const testingIndex = navigation.findIndex(item => item.name === 'Testing')
    if (testingIndex !== -1) {
      navigation.splice(testingIndex, 1)
      console.log('Testing menu removed from navigation')
    }
  }
}, { immediate: true })

// Use computed for current path to ensure reactivity
const currentPath = computed(() => route.path)

// Watch for route changes to update current state
watch(currentPath, (path) => {
  navigation.forEach(item => {
    if (item.href === path) {
      item.current = true
    } else if (item.children) {
      item.current = item.children.some(child => child.href === path)
    } else {
      item.current = false
    }
  })
}, { immediate: true })

async function handleSignOut() {
  try {
    await client.auth.signOut()
    router.push('/auth/login')
  } catch (error) {
    console.error('Error signing out:', error)
  }
}
</script>
