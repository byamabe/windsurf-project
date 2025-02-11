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
            <div class="relative">
              <button
                type="button"
                class="flex items-center space-x-3 rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                @click="isUserMenuOpen = !isUserMenuOpen"
              >
                <img
                  v-if="userProfile?.avatar_url"
                  :src="userProfile.avatar_url"
                  :alt="userProfile.display_name"
                  class="h-8 w-8 rounded-full"
                />
                <span v-else class="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  {{ userProfile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?' }}
                </span>
                <span>{{ userProfile?.display_name || user?.email || 'Anonymous' }}</span>
              </button>

              <!-- User dropdown menu -->
              <div
                v-if="isUserMenuOpen"
                class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <NuxtLink
                  to="/profile"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="isUserMenuOpen = false"
                >
                  Your Profile
                </NuxtLink>
                <NuxtLink
                  v-if="isAdminUser"
                  to="/admin/podcasts"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="isUserMenuOpen = false"
                >
                  Admin
                </NuxtLink>
                <NuxtLink
                  to="/settings"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="isUserMenuOpen = false"
                >
                  Settings
                </NuxtLink>
                <button
                  class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  @click="handleLogout"
                >
                  Sign out
                </button>
              </div>
            </div>
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
          <NuxtLink
            to="/podcasts"
            class="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            @click="isMobileMenuOpen = false"
          >
            Podcasts
          </NuxtLink>
          <NuxtLink
            to="/media"
            class="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            @click="isMobileMenuOpen = false"
          >
            Media
          </NuxtLink>
          <NuxtLink
            to="/loci"
            class="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            @click="isMobileMenuOpen = false"
          >
            Loci
          </NuxtLink>
          <NuxtLink
            to="/authors"
            class="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            @click="isMobileMenuOpen = false"
          >
            Authors
          </NuxtLink>
          <NuxtLink
            to="/questions"
            class="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            @click="isMobileMenuOpen = false"
          >
            Questions
          </NuxtLink>
        </div>

        <div class="border-t border-gray-200 pt-4 pb-3">
          <template v-if="user">
            <div class="flex items-center px-4">
              <div class="flex-shrink-0">
                <img
                  v-if="userProfile?.avatar_url"
                  :src="userProfile.avatar_url"
                  :alt="userProfile.display_name"
                  class="h-10 w-10 rounded-full"
                />
                <span
                  v-else
                  class="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg"
                >
                  {{ userProfile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?' }}
                </span>
              </div>
              <div class="ml-3">
                <div class="text-base font-medium text-gray-800">
                  {{ userProfile?.display_name || user?.email || 'Anonymous' }}
                </div>
                <div class="text-sm font-medium text-gray-500">{{ user?.email }}</div>
              </div>
            </div>
            <div class="mt-3 space-y-1">
              <NuxtLink
                to="/profile"
                class="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                @click="isMobileMenuOpen = false"
              >
                Your Profile
              </NuxtLink>
              <NuxtLink
                v-if="isAdminUser"
                to="/admin/podcasts"
                class="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                @click="isMobileMenuOpen = false"
              >
                Admin
              </NuxtLink>
              <NuxtLink
                to="/settings"
                class="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                @click="isMobileMenuOpen = false"
              >
                Settings
              </NuxtLink>
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
import { ref, onMounted, watch } from 'vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import type { Database } from '~/types/database.types'
import type { Profile } from '~/types/supabase'

const user = useSupabaseUser()
const supabase = useSupabaseClient<Database>()
const { isAdmin } = useAuth()

const showLoginModal = ref(false)
const showSignupModal = ref(false)
const isMobileMenuOpen = ref(false)
const isUserMenuOpen = ref(false)
const userProfile = ref<Profile | null>(null)
const isAdminUser = ref(false)

onMounted(async () => {
  await fetchUserProfile()
  await checkAdminStatus()
})

watch(user, async () => {
  await fetchUserProfile()
  await checkAdminStatus()
})

const checkAdminStatus = async () => {
  if (user.value) {
    isAdminUser.value = await isAdmin()
  } else {
    isAdminUser.value = false
  }
}

// Watch for user changes and fetch profile when needed
watch(user, async (newUser) => {
  if (newUser) {
    await fetchUserProfile()
  } else {
    userProfile.value = null
  }
})

async function fetchUserProfile() {
  try {
    if (!user.value?.id) return

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error.message)
      return
    }

    userProfile.value = data
  } catch (error) {
    console.error('Error in fetchUserProfile:', error)
  }
}

async function handleLogout() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    // Clear user state
    userProfile.value = null
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
</script>
