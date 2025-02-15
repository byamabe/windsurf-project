<template>
  <BaseModal
    :model-value="!!modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="sm:mx-auto sm:w-full">
      <h2 class="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">Create your account</h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Or
        <button
          class="font-medium text-blue-600 hover:text-blue-500"
          @click="switchToLogin"
        >
          sign in to your account
        </button>
      </p>
    </div>

    <div class="mt-8">
      <form class="space-y-6" @submit.prevent="handleSignup">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
          <div class="mt-1">
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <div class="mt-1">
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label for="confirm-password" class="block text-sm font-medium text-gray-700">Confirm password</label>
          <div class="mt-1">
            <input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              required
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading || !isPasswordValid"
            class="flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {{ isLoading ? 'Creating account...' : 'Create account' }}
          </button>
        </div>

        <div v-if="!isPasswordValid && password && confirmPassword" class="mt-2 text-sm text-red-600">
          Passwords do not match
        </div>
      </form>

      <div v-if="error" class="mt-4 text-sm text-red-600">
        {{ error }}
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from '#imports'
import { useSupabaseClient } from '#imports'

const supabase = useSupabaseClient()
const router = useRouter()

const props = defineProps<{
  modelValue?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'close': [],
  'switch-to-login': [],
  'success': [],
  'error': [error: Error]
}>()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const error = ref('')

const isPasswordValid = computed(() => {
  return !password.value || !confirmPassword.value || password.value === confirmPassword.value
})

async function handleSignup() {
  try {
    error.value = ''
    isLoading.value = true

    if (password.value !== confirmPassword.value) {
      throw new Error('Passwords do not match')
    }
    
    const { error: signUpError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value
    })

    if (signUpError) throw signUpError

    // Clear form
    email.value = ''
    password.value = ''
    confirmPassword.value = ''
    error.value = ''
    
    // Close modal
    emit('update:modelValue', false)
    
    // Emit success
    emit('success')
  } catch (err: any) {
    error.value = err.message
    emit('error', err)
  } finally {
    isLoading.value = false
  }
}

function handleClose() {
  emit('update:modelValue', false)
  emit('close')
}

function switchToLogin() {
  handleClose()
  emit('switch-to-login')
}
</script>
