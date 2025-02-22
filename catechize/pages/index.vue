<template>
  <div class="min-h-screen bg-gray-900">
    <HeroSection />
    
    <div class="mt-[-100px] relative z-10">
      <!-- Featured Content -->
      <ContentRow
        title="Featured Podcasts"
        :items="displayPodcasts"
        viewAllLink="/podcasts"
      />

      <!-- Latest Episodes -->
      <ContentRow
        title="Latest Episodes"
        :items="displayEpisodes"
        viewAllLink="/episodes"
      />

      <!-- Popular in Loci -->
      <ContentRow
        title="Popular in Loci"
        :items="popularLoci"
        viewAllLink="/loci"
      />

      <!-- Top Authors -->
      <ContentRow
        title="Top Authors"
        :items="topAuthors"
        viewAllLink="/authors"
      />

      <!-- Trending Questions -->
      <ContentRow
        title="Trending Questions"
        :items="trendingQuestions"
        viewAllLink="/questions"
      />
    </div>

    <!-- Premium Content Banner -->
    <section class="relative mt-12 py-16 overflow-hidden">
      <div class="absolute inset-0 bg-blue-600 opacity-90"></div>
      <div class="relative container mx-auto px-4">
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="text-3xl font-bold text-white mb-4">
            Unlock Premium Content
          </h2>
          <p class="text-xl text-white/90 mb-8">
            Get access to exclusive episodes, create custom playlists, and join the discussion with other members.
          </p>
          <NuxtLink to="/subscribe" class="bg-white text-blue-600 px-8 py-3 rounded-md hover:bg-gray-100 font-semibold">
            Start Your Free Trial
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Podcast } from '~/composables/usePodcast'
import type { Episode } from '~/composables/useEpisode'

interface DisplayItem {
  id: string | number
  title: string
  description: string | null
  cover_image_url: string | null
  link: string
}

// Initialize composables
const { fetchPodcasts } = usePodcast()
const { fetchEpisodes: fetchEpisodesByPodcast } = useEpisode()

// State for our data
const featuredPodcasts = ref<Podcast[]>([])
const episodes = ref<Episode[]>([])
const displayPodcasts = ref<DisplayItem[]>([])
const displayEpisodes = ref<DisplayItem[]>([])

const popularLoci = ref<DisplayItem[]>([
  {
    id: 1,
    title: "Christology",
    description: null,
    cover_image_url: "https://placehold.co/640x360/be185d/ffffff?text=Christology",
    link: "#"
  },
  {
    id: 2,
    title: "Soteriology",
    description: null,
    cover_image_url: "https://placehold.co/640x360/db2777/ffffff?text=Soteriology",
    link: "#"
  },
  {
    id: 3,
    title: "Ecclesiology",
    description: null,
    cover_image_url: "https://placehold.co/640x360/ec4899/ffffff?text=Ecclesiology",
    link: "#"
  },
  {
    id: 4,
    title: "Sacraments",
    description: null,
    cover_image_url: "https://placehold.co/640x360/f472b6/ffffff?text=Sacraments",
    link: "#"
  },
  {
    id: 5,
    title: "Creation",
    description: null,
    cover_image_url: "https://placehold.co/640x360/f9a8d4/ffffff?text=Creation",
    link: "#"
  }
])

const topAuthors = ref<DisplayItem[]>([
  {
    id: 1,
    title: "Luther",
    description: null,
    cover_image_url: "https://placehold.co/640x360/7c3aed/ffffff?text=Luther",
    link: "#"
  },
  {
    id: 2,
    title: "Walther",
    description: null,
    cover_image_url: "https://placehold.co/640x360/8b5cf6/ffffff?text=Walther",
    link: "#"
  },
  {
    id: 3,
    title: "Gerhard",
    description: null,
    cover_image_url: "https://placehold.co/640x360/a78bfa/ffffff?text=Gerhard",
    link: "#"
  },
  {
    id: 4,
    title: "Sasse",
    description: null,
    cover_image_url: "https://placehold.co/640x360/c4b5fd/ffffff?text=Sasse",
    link: "#"
  },
  {
    id: 5,
    title: "Giertz",
    description: null,
    cover_image_url: "https://placehold.co/640x360/ddd6fe/ffffff?text=Giertz",
    link: "#"
  }
])

const trendingQuestions = ref<DisplayItem[]>([
  {
    id: 1,
    title: "Baptism",
    description: "What is Baptism?",
    cover_image_url: "https://placehold.co/640x360/059669/ffffff?text=Baptism",
    link: "#"
  },
  {
    id: 2,
    title: "Lord's Supper",
    description: "What is the Lord's Supper?",
    cover_image_url: "https://placehold.co/640x360/10b981/ffffff?text=Lords+Supper",
    link: "#"
  },
  {
    id: 3,
    title: "Confession",
    description: "What is Confession?",
    cover_image_url: "https://placehold.co/640x360/34d399/ffffff?text=Confession",
    link: "#"
  },
  {
    id: 4,
    title: "Worship",
    description: "What is Worship?",
    cover_image_url: "https://placehold.co/640x360/6ee7b7/ffffff?text=Worship",
    link: "#"
  },
  {
    id: 5,
    title: "Faith",
    description: "What is Faith?",
    cover_image_url: "https://placehold.co/640x360/a7f3d0/ffffff?text=Faith",
    link: "#"
  }
])

// Fetch episodes
const fetchAllEpisodes = async () => {
  const allEpisodes: Episode[] = []
  const podcasts = await fetchPodcasts()
  if (podcasts) {
    for (const podcast of podcasts) {
      const podcastEpisodes = await fetchEpisodesByPodcast(podcast.id)
      if (podcastEpisodes) {
        allEpisodes.push(...podcastEpisodes)
      }
    }
  }
  episodes.value = allEpisodes
}

onMounted(async () => {
  try {
    // First fetch podcasts
    const podcasts = await fetchPodcasts()
    if (!podcasts) {
      console.error('No podcasts found')
      return
    }

    featuredPodcasts.value = podcasts

    // Transform podcasts for display
    displayPodcasts.value = podcasts.map(podcast => ({
      id: podcast.id,
      title: podcast.title,
      description: null,
      cover_image_url: podcast.cover_image_url || null,
      link: `/podcasts/${podcast.id}`
    } satisfies DisplayItem))

    await fetchAllEpisodes()

    // Sort episodes by date and take latest
    const publishedEpisodes = episodes.value
      .filter(episode => episode.status === 'published' && typeof episode.title === 'string' && episode.title.length > 0)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 4)

    // Transform episodes for display with explicit type assertion
    displayEpisodes.value = publishedEpisodes.map(episode => {
      const [mainTitle] = episode.title.split(' - ')
      const displayItem: DisplayItem = {
        id: episode.id,
        title: mainTitle || episode.title, // Fallback to full title if split fails
        description: episode.description,
        cover_image_url: null,
        link: `/episodes/${episode.id}`
      }
      return displayItem
    })
  } catch (error) {
    console.error('Error fetching content:', error)
  }
})
</script>
