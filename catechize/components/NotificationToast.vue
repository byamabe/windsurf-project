<template>
  <div class="fixed top-4 right-4 z-50 space-y-4">
    <TransitionGroup name="notification">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300',
          {
            'bg-green-50 text-green-800': notification.type === 'success',
            'bg-red-50 text-red-800': notification.type === 'error',
            'bg-blue-50 text-blue-800': notification.type === 'info',
            'bg-yellow-50 text-yellow-800': notification.type === 'warning'
          }
        ]"
      >
        <div class="flex items-start">
          <div class="flex-1">
            <h3 class="text-sm font-medium">{{ notification.title }}</h3>
            <p class="mt-1 text-sm opacity-90">{{ notification.description }}</p>
          </div>
          <button
            @click="remove(notification.id)"
            class="ml-4 inline-flex text-gray-400 hover:text-gray-500"
          >
            <span class="sr-only">Close</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useNotification } from '~/composables/useNotification'

const { notifications, remove } = useNotification()
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
