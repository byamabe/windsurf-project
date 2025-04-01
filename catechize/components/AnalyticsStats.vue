<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-gray-800">{{ title }}</h2>
      <div class="flex items-center space-x-4">
        <select
          v-model="selectedRange"
          class="form-select rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-gray-50 rounded-lg p-4"
      >
        <div class="text-sm font-medium text-gray-500">{{ stat.label }}</div>
        <div class="mt-1 text-2xl font-semibold text-gray-900">{{ stat.value }}</div>
        <div
          class="mt-1 text-sm"
          :class="stat.change >= 0 ? 'text-green-600' : 'text-red-600'"
        >
          {{ stat.change >= 0 ? '+' : '' }}{{ stat.change }}%
        </div>
      </div>
    </div>

    <div v-if="events && events.length > 0" class="mt-8">
      <h3 class="text-lg font-medium text-gray-800 mb-4">Recent Activity</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event
              </th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="event in events" :key="event.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatEventType(event.event_type) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(event.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ event.user_id || 'Anonymous' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { AnalyticsEvent } from '~/composables/useAnalytics'

interface DatabaseAnalyticsEvent extends AnalyticsEvent {
  id: string
  created_at: string
  user_id?: string
}

const props = defineProps<{
  title: string
  stats: Array<{
    label: string
    value: number | string
    change: number
  }>
  events?: DatabaseAnalyticsEvent[]
}>()

const selectedRange = ref('30')

const formatEventType = (type: string) => {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
