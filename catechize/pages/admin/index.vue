<template>
  <div class="min-h-screen bg-gray-100">
    <div class="py-10">
      <header>
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold leading-tight tracking-tight text-gray-900">Admin Dashboard</h1>
        </div>
      </header>
      <main>
        <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <!-- Stats Overview -->
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
            <!-- Podcasts Stats -->
            <div class="overflow-hidden rounded-lg bg-white shadow">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <MicrophoneIcon class="h-6 w-6 text-gray-400" aria-hidden="true" />
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="truncate text-sm font-medium text-gray-500">Total Podcasts</dt>
                      <dd>
                        <div class="text-lg font-medium text-gray-900">{{ stats.podcasts }}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-5 py-3">
                <div class="text-sm">
                  <NuxtLink to="/admin/podcasts" class="font-medium text-blue-700 hover:text-blue-900">
                    Manage podcasts
                  </NuxtLink>
                </div>
              </div>
            </div>

            <!-- Users Stats -->
            <div class="overflow-hidden rounded-lg bg-white shadow">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <UserGroupIcon class="h-6 w-6 text-gray-400" aria-hidden="true" />
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="truncate text-sm font-medium text-gray-500">Total Users</dt>
                      <dd>
                        <div class="text-lg font-medium text-gray-900">{{ stats.users }}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-5 py-3">
                <div class="text-sm">
                  <NuxtLink to="/admin/users" class="font-medium text-blue-700 hover:text-blue-900">
                    Manage users
                  </NuxtLink>
                </div>
              </div>
            </div>

            <!-- Subscriptions Stats -->
            <div class="overflow-hidden rounded-lg bg-white shadow">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <CreditCardIcon class="h-6 w-6 text-gray-400" aria-hidden="true" />
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="truncate text-sm font-medium text-gray-500">Active Subscriptions</dt>
                      <dd>
                        <div class="text-lg font-medium text-gray-900">{{ stats.activeSubscriptions }}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-5 py-3">
                <div class="text-sm">
                  <NuxtLink to="/admin/subscriptions" class="font-medium text-blue-700 hover:text-blue-900">
                    Manage subscriptions
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="mt-8">
            <div class="overflow-hidden bg-white shadow sm:rounded-lg">
              <div class="px-4 py-5 sm:px-6">
                <h3 class="text-lg font-medium leading-6 text-gray-900">Recent Activity</h3>
              </div>
              <div class="border-t border-gray-200">
                <ul role="list" class="divide-y divide-gray-200">
                  <li v-for="activity in recentActivity" :key="activity.id" class="px-4 py-4 sm:px-6">
                    <div class="flex items-center space-x-4">
                      <div class="flex-shrink-0">
                        <span class="inline-flex h-8 w-8 items-center justify-center rounded-full" :class="activityTypeColor(activity.type)">
                          <component :is="activityTypeIcon(activity.type)" class="h-5 w-5 text-white" />
                        </span>
                      </div>
                      <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-medium text-gray-900">
                          {{ activity.description }}
                        </p>
                        <p class="truncate text-sm text-gray-500">
                          {{ formatDate(activity.timestamp) }}
                        </p>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSupabaseClient } from '#imports'
import type { Database } from '~/types/supabase'
import {
  MicrophoneIcon,
  UserGroupIcon,
  CreditCardIcon,
  DocumentTextIcon,
  UserIcon,
  CurrencyDollarIcon
} from '@heroicons/vue/24/outline'

// Define middleware
definePageMeta({
  middleware: ['auth']
})

const supabase = useSupabaseClient<Database>()

interface Stats {
  podcasts: number
  users: number
  activeSubscriptions: number
}

interface Activity {
  id: string
  type: 'user' | 'subscription' | 'podcast'
  description: string
  timestamp: string
}

const stats = ref<Stats>({
  podcasts: 0,
  users: 0,
  activeSubscriptions: 0
})

const recentActivity = ref<Activity[]>([])

// Fetch dashboard stats
async function fetchStats() {
  try {
    // Fetch podcast count
    const { count: podcastCount } = await supabase
      .from('podcasts')
      .select('*', { count: 'exact', head: true })

    // Fetch user count
    const { count: userCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Fetch active subscription count
    const { count: subscriptionCount } = await supabase
      .from('user_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    stats.value = {
      podcasts: podcastCount || 0,
      users: userCount || 0,
      activeSubscriptions: subscriptionCount || 0
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

// Fetch recent activity
async function fetchRecentActivity() {
  try {
    // Example: fetch last 10 activities
    const { data } = await supabase
      .from('admin_activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (data) {
      recentActivity.value = data.map(activity => ({
        id: activity.id,
        type: activity.type,
        description: activity.description,
        timestamp: activity.created_at
      }))
    }
  } catch (error) {
    console.error('Error fetching activity:', error)
  }
}

// Helper functions
function activityTypeIcon(type: Activity['type']) {
  switch (type) {
    case 'user':
      return UserIcon
    case 'subscription':
      return CurrencyDollarIcon
    case 'podcast':
      return MicrophoneIcon
    default:
      return DocumentTextIcon
  }
}

function activityTypeColor(type: Activity['type']) {
  switch (type) {
    case 'user':
      return 'bg-blue-500'
    case 'subscription':
      return 'bg-green-500'
    case 'podcast':
      return 'bg-purple-500'
    default:
      return 'bg-gray-500'
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Initialize data
onMounted(() => {
  fetchStats()
  fetchRecentActivity()
})
</script>
