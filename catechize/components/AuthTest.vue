<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 class="text-3xl font-bold mb-8">Authentication Test Page</h1>
    <p class="mb-8">Test and verify authentication functionality</p>

    <!-- Authentication Status -->
    <div class="bg-white shadow rounded-lg p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">Authentication Status</h2>
      <div class="space-y-4">
        <p>
          <span class="font-medium">Login Status:</span>
          <span 
            :class="user ? 'text-green-600' : 'text-red-600'"
            class="ml-2 font-medium"
          >
            {{ user ? 'Logged In' : 'Not Logged In' }}
          </span>
        </p>
        <template v-if="user">
          <p><span class="font-medium">User ID:</span> <span class="ml-2">{{ user.id }}</span></p>
          <p><span class="font-medium">Email:</span> <span class="ml-2">{{ user.email }}</span></p>
          <p v-if="user.last_sign_in_at">
            <span class="font-medium">Last Sign In:</span> 
            <span class="ml-2">{{ formatDate(user.last_sign_in_at) }}</span>
          </p>
        </template>
      </div>
    </div>

    <!-- Current Auth State -->
    <div class="mb-6 p-4 bg-gray-50 rounded-lg">
      <h3 class="font-semibold mb-2">Current Auth State:</h3>
      <pre class="whitespace-pre-wrap">{{ JSON.stringify(user || 'Not logged in', null, 2) }}</pre>
    </div>

    <!-- User Profile -->
    <div v-if="user && profile" class="mb-6 p-4 bg-gray-50 rounded-lg">
      <h3 class="font-semibold mb-2">User Profile:</h3>
      <pre class="whitespace-pre-wrap">{{ JSON.stringify(profile, null, 2) }}</pre>
    </div>

    <!-- Roles and Permissions -->
    <div v-if="user" class="bg-white shadow rounded-lg p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">Roles and Subscription</h2>
      <div class="space-y-4">
        <div>
          <h3 class="font-medium text-lg mb-2">Roles:</h3>
          <div v-if="userRoles.length > 0" class="space-y-2">
            <div v-for="role in userRoles" :key="role.id" class="flex items-center space-x-2">
              <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded">{{ role.name }}</span>
              <span class="text-gray-600">{{ role.description || '' }}</span>
            </div>
          </div>
          <p v-else class="text-gray-600">No roles assigned</p>
        </div>
        
        <div>
          <h3 class="font-medium text-lg mb-2">Subscription:</h3>
          <div v-if="subscription" class="space-y-2">
            <p><span class="font-medium">Tier:</span> <span class="ml-2 capitalize">{{ subscription.tier }}</span></p>
            <p><span class="font-medium">Status:</span> 
              <span 
                :class="isSubscriptionActive ? 'text-green-600' : 'text-red-600'"
                class="ml-2 font-medium"
              >
                {{ isSubscriptionActive ? 'Active' : 'Inactive' }}
              </span>
            </p>
            <p v-if="subscription.ends_at">
              <span class="font-medium">Expires:</span> 
              <span class="ml-2">{{ formatDate(subscription.ends_at) }}</span>
            </p>
          </div>
          <p v-else class="text-gray-600">No subscription found</p>
        </div>

        <div>
          <h3 class="font-medium text-lg mb-2">Admin Status:</h3>
          <p>
            <span 
              :class="isAdmin ? 'text-green-600' : 'text-gray-600'"
              class="font-medium"
            >
              {{ isAdmin ? 'Admin Access Granted' : 'Not an Admin' }}
            </span>
          </p>
        </div>
      </div>
    </div>

    <!-- Auth Actions -->
    <div class="space-x-4">
      <div v-if="!user" class="space-x-4">
        <button
          @click="showLoginModal = true"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Sign In
        </button>
        <button
          @click="showSignupModal = true"
          class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Sign Up
        </button>
      </div>
      
      <div v-else class="space-x-4">
        <button
          @click="handleLogout"
          class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Sign Out
        </button>
        <button
          @click="refreshProfile"
          class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Refresh Profile
        </button>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
      <p class="font-semibold">Error:</p>
      <p>{{ error }}</p>
    </div>

    <!-- Test Results -->
    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-2xl font-bold mb-4">Test Results</h2>
      <div class="space-y-2">
        <div
          v-for="(result, index) in testResults"
          :key="index"
          class="p-2 rounded"
          :class="{
            'bg-green-50 text-green-700': result.status === 'success',
            'bg-red-50 text-red-700': result.status === 'error',
            'bg-yellow-50 text-yellow-700': result.status === 'warning'
          }"
        >
          <p class="font-semibold">{{ result.name }}</p>
          <p>{{ result.message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import type { Database, Role, UserSubscription } from '~/types/supabase'

const user = useSupabaseUser()
const client = useSupabaseClient<Database>()
const supabase = useSupabaseClient<Database>()

interface TestResult {
  name: string
  status: 'success' | 'error' | 'warning'
  message: string
  timestamp: string
}

interface UserRoleWithRole {
  role: Role
}

// State
const showLoginModal = ref(false)
const showSignupModal = ref(false)
const error = ref<string | null>(null)
const profile = ref(null)
const userRoles = ref<Role[]>([])
const subscription = ref<UserSubscription | null>(null)
const testResults = ref<TestResult[]>([])
const isAdmin = ref(false)

// Computed properties
const isSubscriptionActive = computed(() => {
  if (!subscription.value) return false
  return subscription.value.is_active
})

// Fetch roles and subscription
const fetchUserData = async () => {
  if (!user.value) return

  try {
    const { data: userRolesData, error: rolesError } = await supabase
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

    if (rolesError) throw rolesError
    
    if (userRolesData) {
      userRoles.value = userRolesData.map(r => r.role)
      isAdmin.value = userRoles.value.some(role => role.name === 'admin')
      addTestResult('Fetch Roles', 'success', `Found ${userRoles.value.length} roles`)
    }

    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.value.id)
      .eq('is_active', true)
      .single()

    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      throw subscriptionError
    }

    subscription.value = subscriptionData
    addTestResult('Fetch Subscription', 'success', subscriptionData ? 'Found subscription' : 'No active subscription')
  } catch (err) {
    console.error('Error fetching user data:', err)
    addTestResult('Fetch User Data', 'error', err instanceof Error ? err.message : 'Unknown error')
  }
}

const handleLogout = async () => {
  try {
    await supabase.auth.signOut()
    user.value = null
    userRoles.value = []
    subscription.value = null
    if (error.value) error.value = ''
    
    addTestResult('Logout', 'success', 'Successfully logged out')
  } catch (err) {
    console.error('Error logging out:', err)
    addTestResult('Logout', 'error', err instanceof Error ? err.message : 'Unknown error')
  }
}

function handleLoginSuccess() {
  showLoginModal.value = false
  error.value = ''
  addTestResult('Login', 'success', 'Successfully logged in')
}

function handleSignupSuccess() {
  showSignupModal.value = false
  error.value = ''
  addTestResult('Signup', 'success', 'Successfully signed up')
}

function handleError(err: Error) {
  error.value = err.message
  addTestResult('Auth Error', 'error', err.message)
}

function switchToLogin() {
  showSignupModal.value = false
  showLoginModal.value = true
}

function switchToSignup() {
  showLoginModal.value = false
  showSignupModal.value = true
}

async function refreshProfile() {
  await fetchUserData()
}

function addTestResult(name: string, status: 'success' | 'error' | 'warning', message: string) {
  testResults.value.unshift({ name, status, message, timestamp: new Date().toLocaleString() })
}

// Auth state change handler
watch(user, async (newUser) => {
  if (newUser) {
    await fetchUserData()
    addTestResult('Auth State', 'success', 'User authenticated')
  } else {
    profile.value = null
    addTestResult('Auth State', 'warning', 'User not authenticated')
  }
})

// Initial auth state check
onMounted(() => {
  if (user.value) {
    addTestResult('Initial Auth', 'success', 'User is already authenticated')
    fetchUserData()
  } else {
    addTestResult('Initial Auth', 'warning', 'No authenticated user')
  }
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString()
}
</script>