<template>
  <BaseModal
    v-if="!embedded"
    :model-value="!!modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="w-full max-w-md">
      <div class="sm:mx-auto sm:w-full">
        <h2 class="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">Sign in to your account</h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Or
          <button
            class="font-medium text-blue-600 hover:text-blue-500"
            @click="switchToSignup"
          >
            create a new account
          </button>
        </p>
      </div>

      <div class="mt-8">
        <form class="space-y-6" @submit.prevent="handleLogin">
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

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                v-model="rememberMe"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-900">Remember me</label>
            </div>

            <div class="text-sm">
              <button
                type="button"
                class="font-medium text-blue-600 hover:text-blue-500"
                @click="handleResetPassword"
              >
                Forgot your password?
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {{ isLoading ? 'Signing in...' : 'Sign in' }}
            </button>
          </div>
        </form>

        <div v-if="error" class="mt-4 text-sm text-red-600">
          {{ error }}
        </div>
      </div>
    </div>
  </BaseModal>

  <!-- Embedded version -->
  <div v-else>
    <div class="sm:mx-auto sm:w-full">
      <h2 class="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">Sign in to your account</h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Or
        <button
          class="font-medium text-blue-600 hover:text-blue-500"
          @click="switchToSignup"
        >
          create a new account
        </button>
      </p>
    </div>

    <div class="mt-8">
      <form class="space-y-6" @submit.prevent="handleLogin">
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

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="rememberMe"
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">Remember me</label>
          </div>

          <div class="text-sm">
            <button
              type="button"
              class="font-medium text-blue-600 hover:text-blue-500"
              @click="handleResetPassword"
            >
              Forgot your password?
            </button>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {{ isLoading ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>
      </form>

      <div v-if="error" class="mt-4 text-sm text-red-600">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSupabaseClient, useRouter } from '#imports'

const supabase = useSupabaseClient()
const router = useRouter()

const props = defineProps<{
  embedded?: boolean
  modelValue?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'close': [],
  'switch-to-signup': [],
  'success': [],
  'error': [error: Error]
}>()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const isLoading = ref(false)
const error = ref('')

async function handleLogin() {
  try {
    error.value = ''
    isLoading.value = true
    
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })

    if (signInError) throw signInError

    // Clear form
    email.value = ''
    password.value = ''
    rememberMe.value = false
    error.value = ''
    
    // Close modal if not embedded
    if (!props.embedded) {
      emit('update:modelValue', false)
    }
    
    // Emit success
    emit('success')
  } catch (err: any) {
    error.value = err.message
    emit('error', err)
  } finally {
    isLoading.value = false
  }
}

async function handleResetPassword() {
  try {
    if (!email.value) {
      error.value = 'Please enter your email address'
      return
    }

    error.value = ''
    isLoading.value = true

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.value)
    if (resetError) throw resetError

    error.value = 'Password reset instructions sent to your email'
  } catch (err: any) {
    error.value = err.message
    emit('error', err)
  } finally {
    isLoading.value = false
  }
}

function handleClose() {
  if (!props.embedded) {
    emit('update:modelValue', false)
  }
  emit('close')
}

function switchToSignup() {
  handleClose()
  emit('switch-to-signup')
}
</script>
