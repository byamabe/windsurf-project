<template>
  <!-- 
    Twitter Player Card Preview
    This is a static preview component that mimics how the episode will appear
    when shared on Twitter. No actual playback functionality since Twitter
    Cards do not support audio playback.
  -->
  <div 
    class="twitter-player-card bg-gray-900 text-white rounded-lg overflow-hidden"
    :style="{ width: '480px', height: '270px' }"
  >
    <!-- Header with branding -->
    <div class="p-4 border-b border-gray-800">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
          <span class="text-lg font-bold">C</span>
        </div>
        <div>
          <h1 class="font-semibold">Catechize</h1>
          <p class="text-xs text-gray-400">Audio Episodes</p>
        </div>
      </div>
    </div>

    <!-- Episode preview -->
    <div class="flex items-center justify-between p-6">
      <div class="flex-1">
        <div class="flex items-center space-x-4">
          <!-- Play button (decorative) -->
          <div class="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
          </div>

          <div>
            <h2 class="font-medium mb-1">Listen on Catechize</h2>
            <p class="text-sm text-gray-400">Click to open full episode</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-900">
      <div class="flex items-center justify-between">
        <span class="text-xs text-gray-400">catechize.org</span>
        <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * TwitterCardPlayer
 * 
 * A static preview component that shows how an episode will appear when shared
 * on Twitter. This is NOT an actual player - Twitter Cards do not support
 * audio playback. Instead, this preview links to the full episode page.
 * 
 * The dimensions (480x270) match Twitter's player card specifications for
 * optimal display in the Twitter feed.
 */
defineProps<{
  audioUrl: string,
  episodeId?: string,
  podcastId?: string
}>()
</script>
