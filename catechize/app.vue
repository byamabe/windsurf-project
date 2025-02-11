<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <TheHeader />

    <main class="flex-grow container mx-auto px-4 py-8 pt-24">
      <NuxtPage />
    </main>

    <footer class="bg-gray-800 text-white py-8 mt-auto">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 class="text-lg font-bold mb-4">About Catechize.org</h3>
            <p class="text-gray-300">A Lutheran media hub for organizing and accessing podcasts and other media content.</p>
          </div>
          <div>
            <h3 class="text-lg font-bold mb-4">Quick Links</h3>
            <ul class="space-y-2">
              <li><NuxtLink to="/about" class="text-gray-300 hover:text-white">About</NuxtLink></li>
              <li><NuxtLink to="/contact" class="text-gray-300 hover:text-white">Contact</NuxtLink></li>
              <li><NuxtLink to="/terms" class="text-gray-300 hover:text-white">Terms of Service</NuxtLink></li>
              <li><NuxtLink to="/privacy" class="text-gray-300 hover:text-white">Privacy Policy</NuxtLink></li>
            </ul>
          </div>
          <div>
            <h3 class="text-lg font-bold mb-4">Subscribe</h3>
            <p class="text-gray-300 mb-4">Get access to premium content and features.</p>
            <NuxtLink to="/subscribe" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Subscribe Now</NuxtLink>
          </div>
        </div>
      </div>
    </footer>
    <NotificationToast />
  </div>
</template>

<script setup lang="ts">
// No setup needed
</script>
