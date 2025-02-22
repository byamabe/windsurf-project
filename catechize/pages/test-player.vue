<template>
  <div class="max-w-2xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Twitter Player Card Test</h1>
    <div class="border rounded p-4">
      <p class="mb-4">This is a test page for Twitter Player Card validation. Share this URL on Twitter to test the player card.</p>
      <p class="text-sm text-gray-600">Episode ID: test-episode-1</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { twitterConfig } from '~/config/twitter'

// Set up meta tags for Twitter Card validation
useHead({
  title: 'Test Episode - Twitter Player Card',
  meta: [
    { name: 'twitter:card', content: 'player' },
    { name: 'twitter:site', content: twitterConfig.siteHandle },
    { name: 'twitter:title', content: 'Test Episode - Twitter Player Card' },
    { name: 'twitter:description', content: 'This is a test episode for Twitter Player Card validation.' },
    { name: 'twitter:image', content: `${twitterConfig.siteUrl}/default-episode-image.png` },
    { name: 'twitter:player', content: `${twitterConfig.siteUrl}/player/test-episode-1` },
    { name: 'twitter:player:width', content: twitterConfig.player.width.toString() },
    { name: 'twitter:player:height', content: twitterConfig.player.height.toString() },
    { property: 'og:type', content: 'music.song' },
    { property: 'og:title', content: 'Test Episode - Twitter Player Card' },
    { property: 'og:description', content: 'This is a test episode for Twitter Player Card validation.' },
    { property: 'og:image', content: `${twitterConfig.siteUrl}/default-episode-image.png` },
    { property: 'og:url', content: `${twitterConfig.siteUrl}/test-player` },
  ],
})
</script>
