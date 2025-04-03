&lt;template&gt;
  &lt;div class="relative"&gt;
    &lt;!-- YouTube iframe container --&gt;
    &lt;div class="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden"&gt;
      &lt;div ref="youtubeContainer" class="w-full h-full"&gt;&lt;/div&gt;
    &lt;/div&gt;

    &lt;!-- Controls overlay --&gt;
    &lt;div class="absolute bottom-0 left-0 right-0 p-4"&gt;
      &lt;MediaControls
        :state="mediaPlayer.state"
        :controls="mediaPlayer.controls"
        :format-time="mediaPlayer.formatTime"
      /&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
import { ref } from 'vue'
import { useMediaPlayer } from '../composables/useMediaPlayer'
import { extractYouTubeId } from '../utils/youtube'
import MediaControls from './MediaControls.vue'

const props = defineProps&lt;{
  videoUrl: string
}&gt;()

const youtubeContainer = ref&lt;HTMLDivElement | null&gt;(null)

// Extract video ID from URL
const videoId = extractYouTubeId(props.videoUrl)
if (!videoId) {
  throw new Error('Invalid YouTube URL')
}

const mediaPlayer = useMediaPlayer({
  type: 'youtube',
  url: videoId
})

// Watch for URL changes and recreate player
watch(() =&gt; props.videoUrl, (newUrl) =&gt; {
  const newVideoId = extractYouTubeId(newUrl)
  if (!newVideoId) {
    throw new Error('Invalid YouTube URL')
  }

  // Clean up old player
  if (mediaPlayer.state.value.isPlaying) {
    mediaPlayer.controls.pause()
  }
  
  // Create new player
  const newPlayer = useMediaPlayer({
    type: 'youtube',
    url: newVideoId
  })
  
  // Update references
  mediaPlayer.state.value = newPlayer.state.value
  mediaPlayer.controls = newPlayer.controls
})

// Expose methods to parent
defineExpose({
  seek: mediaPlayer.controls.seek,
  seekTo: mediaPlayer.controls.seek
})
&lt;/script&gt;
