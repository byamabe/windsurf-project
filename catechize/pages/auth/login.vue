<template>
  <div class="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Sign in to your account
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div v-if="error" class="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {{ error }}
        </div>
        
        <!-- Auth Components -->
        <div class="space-y-6">
          <AuthLoginModal
            :embedded="true"
            @success="handleSuccess"
            @error="handleError"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from '#imports'

const router = useRouter()
const error = ref('')

function handleSuccess() {
  router.push('/auth/test')
}

function handleError(err: Error) {
  error.value = err.message
}

// If user is already logged in, redirect to test page
const user = useSupabaseUser()
watch(user, (newUser) => {
  if (newUser) {
    router.push('/auth/test')
  }
}, { immediate: true })
</script>
