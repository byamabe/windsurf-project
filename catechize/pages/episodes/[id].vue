<template>
  <div class="min-h-screen bg-gray-900">
    <div class="container mx-auto px-4">
      <div v-if="episode" class="max-w-4xl mx-auto -mt-16 pt-16">
        <!-- Episode Header -->
        <div class="pb-4">
          <h1 class="text-3xl font-bold text-white mb-2">{{ episode.title }}</h1>
          <p class="text-gray-400 text-lg mb-2">{{ episode.description }}</p>
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-500">
              Published {{ formatDate(episode.publishedAt || null) }}
            </div>
            <!-- User interaction buttons -->
            <div class="flex items-center space-x-4">
              <button
                @click="handleShare"
                class="text-gray-400 hover:text-white focus:outline-none transition-colors"
                title="Share Episode"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
              <button
                @click="toggleFavorite"
                class="focus:outline-none transition-colors"
                :class="isFavorited ? 'text-yellow-500 hover:text-yellow-400' : 'text-gray-400 hover:text-white'"
                title="Favorite Episode"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
              <button
                @click="togglePlaylist"
                class="focus:outline-none transition-colors"
                :class="isInPlaylist ? 'text-blue-500 hover:text-blue-400' : 'text-gray-400 hover:text-white'"
                title="Add to Playlist"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Share Modal -->
        <div v-if="showShareModal" class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/50" @click="showShareModal = false"></div>
          <div class="relative bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 class="text-xl font-semibold text-white mb-4">Share Episode</h3>
            <div class="space-y-4">
              <button
                v-for="platform in sharePlatforms"
                :key="platform.name"
                @click="shareToPlaftorm(platform.name)"
                class="w-full flex items-center justify-between px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
              >
                <span>{{ platform.label }}</span>
                <component :is="platform.icon" class="w-5 h-5" />
              </button>
            </div>
            <button
              @click="showShareModal = false"
              class="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Player Section -->
        <div class="sticky top-16 z-40 bg-gray-900 p-4 rounded-lg shadow-lg">
          <!-- Video Player -->
          <div v-if="episode.videoUrl" class="mb-4">
            <YouTubeEmbed
              v-if="isYouTubeUrl(episode.videoUrl)"
              :videoId="getYouTubeVideoId(episode.videoUrl)"
              ref="youtubePlayerRef"
              @timeupdate="handleTimeUpdate"
              @seeked="handleYouTubeSeek"
            />
            <video
              v-else
              ref="videoRef"
              :src="episode.videoUrl"
              class="w-full aspect-video rounded-lg"
              controls
              @timeupdate="handleVideoTimeUpdate"
              @seeked="handleVideoSeek"
            />
          </div>

          <!-- Audio Player -->
          <div v-if="episode.audioUrl" class="mb-4">
            <AudioPlayer
              :audio-url="episode.audioUrl"
              ref="audioPlayerRef"
              @timeupdate="handleTimeUpdate"
            />
          </div>
        </div>

        <!-- Transcript -->
        <div v-if="episode.transcript" class="py-8">
          <h2 class="text-2xl font-bold text-white mb-4">Transcript</h2>
          <InteractiveTranscript 
            :transcript="episode.transcript"
            :current-time="currentTime"
            @seek="handleTranscriptSeek"
          />
        </div>

        <!-- Premium Content Notice -->
        <div v-if="episode.isPremium" class="mt-8 bg-blue-900/50 border border-blue-500/20 rounded-lg p-6">
          <h3 class="text-xl font-semibold text-white mb-2">Premium Content</h3>
          <p class="text-gray-300">
            This episode is exclusive to premium members. 
            <NuxtLink to="/subscribe" class="text-blue-400 hover:text-blue-300">
              Subscribe now
            </NuxtLink> 
            to access all premium content.
          </p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p class="text-gray-400 mt-4">Loading episode...</p>
      </div>

      <!-- Error State -->
      <div v-else class="text-center py-12">
        <p class="text-red-500">Failed to load episode. Please try again later.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from '#imports'
import { useRuntimeConfig } from 'nuxt/app'
import { useEpisode } from '~/composables/useEpisode'
import type { Episode } from '~/composables/useEpisode'
import { useTwitterCard } from '~/composables/useTwitterCard'
import { useAnalytics } from '~/composables/useAnalytics'
import type { AnalyticsEvent } from '~/composables/useAnalytics'
import { twitterConfig } from '~/config/twitter'
import AudioPlayer from '~/components/AudioPlayer.vue'
import YouTubeEmbed from '~/components/YouTubeEmbed.vue'
import InteractiveTranscript from '~/components/InteractiveTranscript.vue'

const route = useRoute()
const { fetchEpisode } = useEpisode()
const { trackEvent } = useAnalytics()
const episode = ref<Episode | null>(null)
const loading = ref(true)
const videoRef = ref<HTMLVideoElement | null>(null)
const youtubePlayerRef = ref<any>(null)
const audioPlayerRef = ref<any>(null)
const currentTime = ref<number>(0)
let lastTime = 0

// UI state
const showShareModal = ref(false)
const isFavorited = ref(false)
const isInPlaylist = ref(false)

// Share platforms
const sharePlatforms = [
  { name: 'twitter', label: 'Twitter', icon: 'TwitterIcon' },
  { name: 'facebook', label: 'Facebook', icon: 'FacebookIcon' },
  { name: 'linkedin', label: 'LinkedIn', icon: 'LinkedInIcon' },
  { name: 'email', label: 'Email', icon: 'MailIcon' }
]

// Analytics tracking functions
const trackViewEvent = () => {
  if (!episode.value?.id) return
  
  trackEvent({
    event_type: 'view',
    episode_id: episode.value.id,
    podcast_id: episode.value.podcastId,
    metadata: {
      source: 'episode_page',
      hasAudio: !!episode.value.audioUrl,
      hasVideo: !!episode.value.videoUrl
    }
  })
}

const trackShareEvent = (platform: string) => {
  if (!episode.value?.id) return
  
  trackEvent({
    event_type: 'share',
    episode_id: episode.value.id,
    podcast_id: episode.value.podcastId,
    metadata: {
      platform,
      source: 'episode_page'
    }
  })
}

const trackFavoriteEvent = (action: 'add' | 'remove') => {
  if (!episode.value?.id) return
  
  trackEvent({
    event_type: 'favorite',
    episode_id: episode.value.id,
    podcast_id: episode.value.podcastId,
    metadata: {
      action,
      source: 'episode_page'
    }
  })
}

const trackPlaylistEvent = (action: 'add' | 'remove') => {
  if (!episode.value?.id) return
  
  trackEvent({
    event_type: 'playlist_add',
    episode_id: episode.value.id,
    podcast_id: episode.value.podcastId,
    metadata: {
      action,
      source: 'episode_page'
    }
  })
}

// User interaction handlers
const handleShare = () => {
  showShareModal.value = true
}

const shareToPlaftorm = (platform: string) => {
  // TODO: Implement actual sharing logic
  trackShareEvent(platform)
  showShareModal.value = false
}

const toggleFavorite = () => {
  // TODO: Implement actual favorite toggling
  isFavorited.value = !isFavorited.value
  trackFavoriteEvent(isFavorited.value ? 'add' : 'remove')
}

const togglePlaylist = () => {
  // TODO: Implement actual playlist management
  isInPlaylist.value = !isInPlaylist.value
  trackPlaylistEvent(isInPlaylist.value ? 'add' : 'remove')
}

// Debug function
function logEpisodeData() {
  console.log('Episode data:', {
    episode: episode.value,
    hasAudio: episode.value?.audioUrl ? true : false,
    audioUrl: episode.value?.audioUrl,
    hasVideo: episode.value?.videoUrl ? true : false,
    videoUrl: episode.value?.videoUrl
  })
}

const formatDate = (date: string | null) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const handleTimeUpdate = (time: number) => {
  // Update current time
  currentTime.value = time
}

const handleVideoTimeUpdate = (event: Event) => {
  const target = event.target as HTMLVideoElement
  handleTimeUpdate(target.currentTime)
}

const handleVideoSeek = (event: Event) => {
  const target = event.target as HTMLVideoElement
  handleSeek({ start: lastTime, end: target.currentTime })
}

const handleYouTubeSeek = (seekInfo: { start: number; end: number }) => {
  handleSeek(seekInfo)
}

const handleTranscriptSeek = (time: number) => {
  handleSeek({ start: lastTime, end: time })
}

const handleSeek = (seekInfo: { start: number; end: number }) => {
  // Handle seek events
  currentTime.value = seekInfo.end
  lastTime = seekInfo.end

  // Update media players
  if (episode.value?.videoUrl) {
    if (isYouTubeUrl(episode.value.videoUrl)) {
      youtubePlayerRef.value?.seek(seekInfo.end)
    } else {
      videoRef.value && (videoRef.value.currentTime = seekInfo.end)
    }
  } else if (episode.value?.audioUrl) {
    const audioElement = audioPlayerRef.value?.getAudioElement()
    if (audioElement) {
      audioElement.currentTime = seekInfo.end
    }
  }
}

const isYouTubeUrl = (url: string): boolean => {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=[^&]+/i,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/[^/?]+/i,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/[^/?]+/i
  ]
  return patterns.some(pattern => pattern.test(url))
}

const getYouTubeVideoId = (url: string): string => {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/i,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^/?]+)/i,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^/?]+)/i
  ]
  const match = patterns.find(pattern => pattern.test(url))
  if (!match) {
    console.error('Invalid YouTube URL:', url)
    return ''
  }
  const result = match.exec(url)
  if (!result || !result[1]) {
    console.error('Could not extract video ID from URL:', url)
    return ''
  }
  return result[1]
}

onMounted(async () => {
  try {
    const id = route.params.id as string
    console.log('Fetching episode:', id)
    const fetchedEpisode = await fetchEpisode(id)

    if (fetchedEpisode) {
      episode.value = fetchedEpisode
      // Track view event after successful load
      trackViewEvent()
      
      console.log('Episode loaded:', {
        id: episode.value.id,
        hasAudio: !!episode.value.audioUrl,
        hasVideo: !!episode.value.videoUrl,
        audioUrl: episode.value.audioUrl,
        videoUrl: episode.value.videoUrl
      })

      // Update Twitter Card meta tags
      const { updateTwitterCard } = useTwitterCard()
      const config = useRuntimeConfig()
      const baseUrl = config.public.siteUrl || 'https://catechize.org'
      
      if (episode.value.audioUrl) {
        updateTwitterCard({
          title: episode.value.title || 'Untitled Episode',
          description: episode.value.description || 'Listen to this episode on Catechize',
          image: episode.value.imageUrl || `${baseUrl}/images/hero-bg.jpg`,
          player: {
            url: `${baseUrl}/episodes/${id}-player`,
            width: twitterConfig.player.width,
            height: twitterConfig.player.height,
            audio: episode.value.audioUrl
          }
        })
      } else {
        // Regular card for episodes without audio
        updateTwitterCard({
          title: episode.value.title || 'Untitled Episode',
          description: episode.value.description || 'View this episode on Catechize',
          image: episode.value.imageUrl || `${baseUrl}/images/hero-bg.jpg`
        })
      }
    } else {
      console.error('Episode not found')
    }
  } catch (error) {
    console.error('Error fetching episode:', error)
  } finally {
    loading.value = false
  }
})
</script>
