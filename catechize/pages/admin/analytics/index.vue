<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Content Analytics</h1>
      <div class="flex items-center space-x-4">
        <select
          v-model="selectedPodcast"
          class="form-select rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">All Podcasts</option>
          <option v-for="podcast in podcasts" :key="podcast.id" :value="podcast.id">
            {{ podcast.title }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>

    <div v-else class="space-y-8">
      <AnalyticsStats
        v-if="!selectedPodcast"
        title="Overall Statistics"
        :stats="overallStats"
        :events="recentEvents"
      />

      <template v-else>
        <AnalyticsStats
          :title="selectedPodcastTitle"
          :stats="podcastStats"
          :events="podcastEvents"
        />

        <div v-if="podcastEpisodes.length > 0" class="mt-8">
          <h2 class="text-xl font-semibold text-gray-800 mb-6">Episode Statistics</h2>
          <div class="grid grid-cols-1 gap-6">
            <div
              v-for="episode in podcastEpisodes"
              :key="episode.id"
              class="bg-white rounded-lg shadow p-6"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-gray-900">{{ episode.title }}</h3>
                <span class="text-sm text-gray-500">
                  Published: {{ formatDate(episode.publishedAt) }}
                </span>
              </div>
              <AnalyticsStats
                :title="''"
                :stats="episodeStatsMap[episode.id] || []"
                :events="episodeEventsMap[episode.id] || []"
              />
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useAnalytics, type AnalyticsEvent } from '~/composables/useAnalytics'
import { usePodcast, type Podcast } from '~/composables/usePodcast'
import { useEpisode, type Episode } from '~/composables/useEpisode'
import AnalyticsStats from '~/components/AnalyticsStats.vue'

interface PodcastWithStats extends Podcast {
  stats?: {
    total_views: number
    total_plays: number
    avg_completion_rate: number
  }
}

const { fetchPodcasts } = usePodcast()
const { fetchEpisodes } = useEpisode()
const { 
  getEpisodeStats,
  getPodcastStats,
  getEpisodeAnalytics,
  getPodcastAnalytics
} = useAnalytics()

const loading = ref(true)
const podcasts = ref<PodcastWithStats[]>([])
const selectedPodcast = ref('')
const podcastEpisodes = ref<Episode[]>([])

const recentEvents = ref<AnalyticsEvent[]>([])
const podcastEvents = ref<AnalyticsEvent[]>([])
const episodeEventsMap = ref<Record<string, AnalyticsEvent[]>>({})
const episodeStatsMap = ref<Record<string, any[]>>({})

const selectedPodcastTitle = computed(() => {
  const podcast = podcasts.value.find(p => p.id === selectedPodcast.value)
  return podcast ? podcast.title : ''
})

const overallStats = computed(() => {
  return [
    {
      label: 'Total Views',
      value: podcasts.value.reduce((sum, podcast) => sum + (podcast.stats?.total_views || 0), 0),
      change: 0
    },
    {
      label: 'Total Plays',
      value: podcasts.value.reduce((sum, podcast) => sum + (podcast.stats?.total_plays || 0), 0),
      change: 0
    },
    {
      label: 'Average Completion Rate',
      value: `${calculateAverageCompletionRate(podcasts.value)}%`,
      change: 0
    }
  ]
})

const podcastStats = computed(() => {
  const podcast = podcasts.value.find(p => p.id === selectedPodcast.value)
  if (!podcast?.stats) return []

  return [
    {
      label: 'Total Views',
      value: podcast.stats.total_views,
      change: 0
    },
    {
      label: 'Total Plays',
      value: podcast.stats.total_plays,
      change: 0
    },
    {
      label: 'Completion Rate',
      value: `${podcast.stats.avg_completion_rate}%`,
      change: 0
    }
  ]
})

const calculateAverageCompletionRate = (podcasts: PodcastWithStats[]) => {
  const rates = podcasts
    .map(p => p.stats?.avg_completion_rate)
    .filter(rate => rate !== undefined)
  
  if (rates.length === 0) return 0
  return Math.round(rates.reduce((sum, rate) => sum + rate, 0) / rates.length)
}

const formatDate = (date: string | null | undefined) => {
  if (!date) return 'Not published'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const loadPodcastData = async () => {
  try {
    loading.value = true
    const podcastsData = await fetchPodcasts()
    podcasts.value = podcastsData || []

    // Load stats for each podcast
    for (const podcast of podcasts.value) {
      const stats = await getPodcastStats(podcast.id)
      if (stats) {
        podcast.stats = {
          total_views: stats.total_views,
          total_plays: stats.total_plays,
          avg_completion_rate: stats.avg_completion_rate
        }
      }
    }

    // Load recent events
    if (podcasts.value.length > 0) {
      const allEvents: AnalyticsEvent[] = []
      for (const podcast of podcasts.value) {
        const events = await getPodcastAnalytics(podcast.id)
        if (events) allEvents.push(...events)
      }
      recentEvents.value = allEvents
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)
    }
  } catch (error) {
    console.error('Error loading podcast data:', error)
  } finally {
    loading.value = false
  }
}

const loadPodcastDetails = async () => {
  if (!selectedPodcast.value) {
    podcastEpisodes.value = []
    podcastEvents.value = []
    episodeEventsMap.value = {}
    episodeStatsMap.value = {}
    return
  }

  try {
    loading.value = true

    // Load podcast events
    const events = await getPodcastAnalytics(selectedPodcast.value)
    podcastEvents.value = events || []

    // Load episodes
    const episodes = await fetchEpisodes(selectedPodcast.value)
    podcastEpisodes.value = episodes || []

    // Load stats for each episode
    for (const episode of podcastEpisodes.value) {
      const [stats, events] = await Promise.all([
        getEpisodeStats(episode.id),
        getEpisodeAnalytics(episode.id)
      ])

      if (stats) {
        episodeStatsMap.value[episode.id] = [
          {
            label: 'Views',
            value: stats.total_views,
            change: 0
          },
          {
            label: 'Plays',
            value: stats.total_plays,
            change: 0
          },
          {
            label: 'Completion Rate',
            value: `${stats.avg_completion_rate}%`,
            change: 0
          }
        ]
      }

      if (events) {
        episodeEventsMap.value[episode.id] = events
      }
    }
  } catch (error) {
    console.error('Error loading podcast details:', error)
  } finally {
    loading.value = false
  }
}

watch(selectedPodcast, loadPodcastDetails)

onMounted(loadPodcastData)
</script>
