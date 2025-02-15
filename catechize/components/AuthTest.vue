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
    <div v-if="user && data.profile" class="mb-6 p-4 bg-gray-50 rounded-lg">
      <h3 class="font-semibold mb-2">User Profile:</h3>
      <pre class="whitespace-pre-wrap">{{ JSON.stringify(data.profile, null, 2) }}</pre>
    </div>

    <!-- Roles and Permissions -->
    <div v-if="user" class="bg-white shadow rounded-lg p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">Roles and Subscription</h2>
      <div class="space-y-4">
        <div>
          <h3 class="font-medium text-lg mb-2">Roles:</h3>
          <div v-if="data.userRoles.length > 0" class="space-y-2">
            <div v-for="role in data.userRoles" :key="role.id" class="flex items-center space-x-2">
              <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded">{{ role.name }}</span>
              <span class="text-gray-600">{{ role.description || '' }}</span>
            </div>
          </div>
          <p v-else class="text-gray-600">No roles assigned</p>
        </div>
        
        <div>
          <h3 class="font-medium text-lg mb-2">Subscription:</h3>
          <div v-if="data.subscription" class="space-y-2">
            <p><span class="font-medium">Tier:</span> <span class="ml-2 capitalize">{{ data.subscription.tier }}</span></p>
            <p><span class="font-medium">Status:</span> 
              <span 
                :class="data.isSubscriptionActive ? 'text-green-600' : 'text-red-600'"
                class="ml-2 font-medium"
              >
                {{ data.isSubscriptionActive ? 'Active' : 'Inactive' }}
              </span>
            </p>
            <p v-if="data.subscription.ends_at">
              <span class="font-medium">Expires:</span> 
              <span class="ml-2">{{ formatDate(data.subscription.ends_at) }}</span>
            </p>
          </div>
          <p v-else class="text-gray-600">No subscription found</p>
        </div>

        <div>
          <h3 class="font-medium text-lg mb-2">Admin Status:</h3>
          <p>
            <span 
              :class="data.isAdmin ? 'text-green-600' : 'text-gray-600'"
              class="font-medium"
            >
              {{ data.isAdmin ? 'Admin Access Granted' : 'Not an Admin' }}
            </span>
          </p>
        </div>
      </div>
    </div>

    <!-- Auth Actions -->
    <div class="space-x-4">
      <div v-if="!user" class="space-x-4">
        <button
          @click="data.showLoginModal = true"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Sign In
        </button>
        <button
          @click="data.showSignupModal = true"
          class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Sign Up
        </button>
      </div>
      
      <div v-else class="space-x-4">
        <button
          @click="handleSignOut"
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
    <div v-if="data.error" class="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
      <p class="font-semibold">Error:</p>
      <p>{{ data.error }}</p>
    </div>

    <!-- Test Results -->
    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-2xl font-bold mb-4">Test Results</h2>
      <div class="space-y-2">
        <div
          v-for="(result, index) in data.testResults"
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
import { ref, reactive, onMounted } from 'vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'

const supabase = useSupabaseClient()
const user = useSupabaseUser()

interface ComponentData {
  profile: any | null
  userRoles: any[]
  subscription: any | null
  isSubscriptionActive: boolean
  isAdmin: boolean
  showLoginModal: boolean
  showSignupModal: boolean
  error: string | null
  testResults: any[]
}

const data = reactive<ComponentData>({
  profile: null,
  userRoles: [],
  subscription: null,
  isSubscriptionActive: false,
  isAdmin: false,
  showLoginModal: false,
  showSignupModal: false,
  error: null,
  testResults: []
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

// Methods
const refreshProfile = async () => {
  // Implementation
}

const handleSignOut = async () => {
  try {
    await supabase.auth.signOut()
    user.value = null
  } catch (error) {
    console.error('Error signing out:', error)
  }
}

onMounted(async () => {
  try {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (currentUser) {
      user.value = currentUser
    }
  } catch (error) {
    console.error('Error fetching user:', error)
  }
})
</script>