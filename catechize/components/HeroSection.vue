<template>
  <section class="relative h-[70vh] min-h-[600px] w-full overflow-hidden">
    <!-- Background Image -->
    <div class="absolute inset-0">
      <img
        src="/images/hero-bg.jpg"
        alt="Hero background"
        class="h-full w-full object-cover"
      />
      <!-- Gradient Overlay -->
      <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
    </div>

    <!-- Content -->
    <div class="relative h-full container mx-auto px-4 flex flex-col justify-center">
      <h1 class="text-4xl md:text-6xl font-bold text-white max-w-2xl mb-4">
        Discover Lutheran Media Content
      </h1>
      <p class="text-xl text-gray-200 max-w-xl mb-8">
        Explore podcasts, videos, and educational resources from trusted Lutheran voices.
      </p>
      <div class="flex space-x-4">
        <button class="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 flex items-center">
          <span class="mr-2">Start Watching</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
          </svg>
        </button>
        <button class="bg-gray-800 text-white px-8 py-3 rounded-md hover:bg-gray-700 flex items-center">
          <span class="mr-2">More Info</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  </section>
</template>
