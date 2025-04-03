<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-white shadow">
    <nav class="container mx-auto px-4 py-4">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-8">
          <NuxtLink to="/" class="text-2xl font-bold text-gray-800">Catechize.org</NuxtLink>
          <div class="hidden md:flex space-x-4">
            <NuxtLink to="/podcasts" class="text-gray-600 hover:text-gray-900">Podcasts</NuxtLink>
            <NuxtLink to="/media" class="text-gray-600 hover:text-gray-900">Media</NuxtLink>
            <NuxtLink to="/loci" class="text-gray-600 hover:text-gray-900">Loci</NuxtLink>
            <NuxtLink to="/authors" class="text-gray-600 hover:text-gray-900">Authors</NuxtLink>
            <NuxtLink to="/questions" class="text-gray-600 hover:text-gray-900">Questions</NuxtLink>
            <Menu v-if="hasTestAccess" as="div" class="relative inline-block text-left dropdown-menu">
              <MenuButton class="text-gray-600 hover:text-gray-900">
                Test Pages
                <ChevronDownIcon class="ml-1 -mr-1 h-5 w-5 inline-block" aria-hidden="true" />
              </MenuButton>
              <transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <MenuItems class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <MenuItem v-slot="{ active }">
                    <button 
                      class="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100" 
                      role="menuitem"
                      @click="() => navigateTo('/admin/test/media-player')"
                    >
                      Media Player Test
                    </button>
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <button 
                      class="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      @click="() => navigateTo('/admin/test/auth')"
                    >
                      Auth Test
                    </button>
                  </MenuItem>
                </MenuItems>
              </transition>
            </Menu>
          </div>
        </div>

        <!-- Mobile menu button -->
        <button
          class="md:hidden rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <span class="sr-only">Open menu</span>
          <svg
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              v-if="isMobileMenuOpen"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>

        <!-- Desktop navigation -->
        <div class="hidden md:flex items-center space-x-4">
          <template v-if="user">
            <!-- User dropdown -->
            <Menu as="div" class="relative">
              <MenuButton class="flex items-center space-x-3 rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <img
                  v-if="profile?.avatar_url"
                  :src="profile.avatar_url"
                  :alt="profile.display_name"
                  class="h-8 w-8 rounded-full"
                />
                <span v-else class="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  {{ profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?' }}
                </span>
                <span>{{ profile?.display_name || user?.email || 'Anonymous' }}</span>
              </MenuButton>
              <transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <MenuItems class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <button 
                    class="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100" 
                    role="menuitem"
                    @click="() => { navigateTo('/profile'); }"
                  >
                    Your Profile
                  </button>
                  <button 
                    v-if="isAdminUser"
                    class="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    @click="() => { navigateTo('/admin/podcasts'); }"
                  >
                    Admin
                  </button>
                  <button 
                    class="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    @click="() => { navigateTo('/settings'); }"
                  >
                    Settings
                  </button>
                  <button 
                    class="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    @click="handleLogout"
                  >
                    Sign out
                  </button>
                </MenuItems>
              </transition>
            </Menu>
          </template>
          <template v-else>
            <button
              class="text-gray-600 hover:text-gray-900"
              @click="showLoginModal = true"
            >
              Sign in
            </button>
            <button
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              @click="showSignupModal = true"
            >
              Sign up
            </button>
          </template>
        </div>
      </div>

      <!-- Mobile menu -->
      <div
        v-if="isMobileMenuOpen"
        class="md:hidden"
      >
        <div class="space-y-1 pt-2 pb-3">
          <button
            class="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            @click="() => { navigateTo('/podcasts'); isMobileMenuOpen = false; }"
          >
            Podcasts
          </button>
          <button
            class="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            @click="() => { navigateTo('/media'); isMobileMenuOpen = false; }"
          >
            Media
          </button>
          <button
            class="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            @click="() => { navigateTo('/loci'); isMobileMenuOpen = false; }"
          >
            Loci
          </button>
          <button
            class="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            @click="() => { navigateTo('/authors'); isMobileMenuOpen = false; }"
          >
            Authors
          </button>
          <button
            class="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            @click="() => { navigateTo('/questions'); isMobileMenuOpen = false; }"
          >
            Questions
          </button>
        </div>

        <div class="border-t border-gray-200 pt-4 pb-3">
          <template v-if="user">
            <div class="flex items-center px-4">
              <div class="flex-shrink-0">
                <img
                  v-if="profile?.avatar_url"
                  :src="profile.avatar_url"
                  :alt="profile.display_name"
                  class="h-10 w-10 rounded-full"
                />
                <span
                  v-else
                  class="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg"
                >
                  {{ profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?' }}
                </span>
              </div>
              <div class="ml-3">
                <div class="text-base font-medium text-gray-800">
                  {{ profile?.display_name || user?.email || 'Anonymous' }}
                </div>
                <div class="text-sm font-medium text-gray-500">{{ user?.email }}</div>
              </div>
            </div>
            <div class="mt-3 space-y-1">
              <button
                class="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                @click="() => { navigateTo('/profile'); isMobileMenuOpen = false; }"
              >
                Your Profile
              </button>
              <button
                v-if="isAdminUser"
                class="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                @click="() => { navigateTo('/admin/podcasts'); isMobileMenuOpen = false; }"
              >
                Admin
              </button>
              <button
                class="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                @click="() => { navigateTo('/settings'); isMobileMenuOpen = false; }"
              >
                Settings
              </button>
              <button
                class="block w-full px-4 py-2 text-left text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                @click="handleLogout"
              >
                Sign out
              </button>
            </div>
          </template>
          <template v-else>
            <div class="space-y-1">
              <button
                class="block w-full px-4 py-2 text-left text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                @click="showLoginModal = true"
              >
                Sign in
              </button>
              <button
                class="block w-full px-4 py-2 text-left text-base font-medium text-blue-600 hover:bg-gray-100"
                @click="showSignupModal = true"
              >
                Sign up
              </button>
            </div>
          </template>
        </div>
      </div>
    </nav>

    <!-- Auth modals -->
    <AuthLoginModal
      v-model="showLoginModal"
      @switch-to-signup="switchToSignup"
    />
    <AuthSignupModal
      v-model="showSignupModal"
      @switch-to-login="switchToLogin"
    />
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  TransitionChild,
  TransitionRoot
} from '@headlessui/vue'
import { ChevronDownIcon } from '@heroicons/vue/20/solid'
import { useRouter } from 'vue-router'

interface Profile {
  id: string
  display_name?: string
  avatar_url?: string
}

interface Role {
  id: string
  name: string
}

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const profile = ref<Profile | null>(null)
const userRoles = ref<Role[]>([])
const userPermissions = ref<string[]>([])
const router = useRouter()

const isAdminUser = computed(() => {
  return userRoles.value.some(role => role.name === 'admin')
})

const hasTestAccess = computed(() => {
  return userPermissions.value.includes('manage:roles')
})

onMounted(() => {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement
    if (!target?.closest('.dropdown-menu')) {
      // Removed custom dropdown state management
    }
  })
})

watch(user, async () => {
  if (user.value) {
    try {
      console.log('Loading permissions for user:', user.value.email)
      // Get user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('roles (*)')
        .eq('user_id', user.value.id)

      if (rolesError) throw rolesError
      const roles = rolesData.map((r: any) => r.roles)
      console.log('User roles:', roles)

      // Get user permissions
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('role_permissions')
        .select('permissions (name)')
        .in('role_id', roles.map(r => r.id))

      if (permissionsError) throw permissionsError
      userPermissions.value = permissionsData.map((p: any) => p.permissions.name)
      console.log('User permissions:', userPermissions.value)
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  } else {
    profile.value = null
    userRoles.value = []
    userPermissions.value = []
  }
}, { immediate: true })

const handleSignOut = async () => {
  try {
    await supabase.auth.signOut()
    user.value = null
  } catch (error) {
    console.error('Error signing out:', error)
  }
}

const showLoginModal = ref(false)
const showSignupModal = ref(false)
const isMobileMenuOpen = ref(false)
const isUserMenuOpen = ref(false)

const handleLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    // Clear user state
    profile.value = null
    userRoles.value = []
    userPermissions.value = []
    isUserMenuOpen.value = false
    
  } catch (error) {
    console.error('Error:', error)
  }
}

function switchToLogin() {
  showSignupModal.value = false
  showLoginModal.value = true
}

function switchToSignup() {
  showLoginModal.value = false
  showSignupModal.value = true
}

function navigateTo(path: string) {
  router.push(path)
}
</script>
