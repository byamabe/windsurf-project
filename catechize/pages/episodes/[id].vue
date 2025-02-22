<template>
  <div class="min-h-screen bg-gray-900">
    <div class="container mx-auto px-4">
      <div v-if="episode" class="max-w-4xl mx-auto -mt-16 pt-16">
        <!-- Episode Header -->
        <div class="pb-4">
          <h1 class="text-3xl font-bold text-white mb-2">{{ episode.title }}</h1>
          <p class="text-gray-400 text-lg mb-2">{{ episode.description }}</p>
          <div class="text-sm text-gray-500">
            Published {{ formatDate(episode.published_at) }}
          </div>
        </div>

        <!-- Player Section -->
        <div class="sticky top-16 z-40 bg-gray-900">
          <div v-if="episode.video_url" class="mb-4 rounded-lg shadow-xl">
            <YouTubeEmbed
              v-if="isYouTubeUrl(episode.video_url)"
              :video-url="episode.video_url"
              ref="youtubePlayerRef"
              @timeupdate="handleTimeUpdate"
            />
            <video
              v-else
              class="w-full aspect-video rounded-lg"
              :src="episode.video_url"
              controls
              preload="metadata"
              ref="videoRef"
              @timeupdate="(e: Event) => {
                const target = e.target as HTMLVideoElement;
                if (target) {
                  handleTimeUpdate(target.currentTime);
                }
              }"
            >
              Your browser does not support the video element.
            </video>
          </div>

          <div v-if="episode.audio_url" class="mb-4">
            <AudioPlayer 
              :audio-url="episode.audio_url" 
              ref="audioRef"
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
            @seek="handleSeek"
          />
        </div>

        <!-- Premium Content Notice -->
        <div v-if="episode.is_premium" class="mt-8 bg-blue-900/50 border border-blue-500/20 rounded-lg p-6">
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
      </div>

      <!-- Error State -->
      <div v-else class="text-center py-12">
        <p class="text-red-500">Failed to load episode</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Episode } from '~/composables/useEpisode'
import { useTwitterCard } from '~/composables/useTwitterCard'

const route = useRoute()
const { fetchEpisode } = useEpisode()

const episode = ref<Episode | null>(null)
const loading = ref(true)
const videoRef = ref<HTMLVideoElement | null>(null)
const youtubePlayerRef = ref<any>(null)
const audioRef = ref<any>(null)
const currentTime = ref<number>(0)

const formatDate = (date: string | null) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const handleTimeUpdate = (time: number) => {
  currentTime.value = Math.floor(time);
};

const handleSeek = (timeInSeconds: number) => {
  if (episode.value?.video_url) {
    if (isYouTubeUrl(episode.value.video_url)) {
      youtubePlayerRef.value?.seekTo(timeInSeconds);
    } else {
      videoRef.value && (videoRef.value.currentTime = timeInSeconds);
    }
  } else if (episode.value?.audio_url) {
    const audioElement = audioRef.value?.getAudioElement();
    if (audioElement) {
      audioElement.currentTime = timeInSeconds;
    }
  }
  
  // Update current time immediately for smoother UI
  currentTime.value = timeInSeconds;
};

const isYouTubeUrl = (url: string): boolean => {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=[^&]+/i,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/[^/?]+/i,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/[^/?]+/i
  ]
  return patterns.some(pattern => pattern.test(url))
}

onMounted(async () => {
  try {
    const id = route.params.id as string
    episode.value = await fetchEpisode(id)
    
    // Update Twitter Card meta tags
    const { updateTwitterCard } = useTwitterCard()
    updateTwitterCard({
      title: episode.value.title,
      description: episode.value.description || 'Listen to this episode on Catechize',
      image: 'https://catechize.org/images/hero-bg.jpg',
      player: {
        url: `https://catechize.org/player/${id}`,
        width: 480,
        height: 240,
        audio: episode.value.audio_url || undefined
      }
    })
  } catch (error) {
    console.error('Error fetching episode:', error)
  } finally {
    loading.value = false
  }
})
</script>
