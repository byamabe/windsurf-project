import type { TwitterConfig } from '~/types/twitter'

export const twitterConfig: TwitterConfig = {
  // Twitter handle that owns the app
  siteHandle: '@CatechizeOrg',
  siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  
  // Card dimensions for audio player
  player: {
    width: 435, // Desktop width
    height: 251, // Desktop height
  },

  // Base URL for the player iframe
  // This will be used in twitter:player meta tag
  playerBaseUrl: '/player',
}

// Types for Twitter Card meta tags
export interface TwitterCardMeta {
  'twitter:card': 'player'
  'twitter:site': string
  'twitter:title': string
  'twitter:description': string
  'twitter:player': string
  'twitter:player:width': string
  'twitter:player:height': string
  'twitter:image'?: string
}

// Helper to generate Twitter Card meta tags for an episode
export function generateTwitterCardMeta(episode: {
  id: string
  title: string
  description: string
  imageUrl?: string
}): TwitterCardMeta {
  return {
    'twitter:card': 'player',
    'twitter:site': twitterConfig.siteHandle,
    'twitter:title': episode.title,
    'twitter:description': episode.description,
    'twitter:player': `${twitterConfig.playerBaseUrl}?episode=${episode.id}`,
    'twitter:player:width': twitterConfig.player.width.toString(),
    'twitter:player:height': twitterConfig.player.height.toString(),
    ...(episode.imageUrl && { 'twitter:image': episode.imageUrl }),
  }
}
