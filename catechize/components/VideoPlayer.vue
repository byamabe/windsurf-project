&lt;template&gt;
  &lt;div class="relative"&gt;
    &lt;!-- Video element --&gt;
    &lt;div class="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden"&gt;
      &lt;video
        ref="videoRef"
        class="w-full h-full object-contain"
        :src="videoUrl"
        @click="mediaPlayer.controls.togglePlay()"
        @dblclick="toggleFullscreen"
      &gt;&lt;/video&gt;
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
import MediaControls from './MediaControls.vue'

const props = defineProps&lt;{
  videoUrl: string
}&gt;()

const videoRef = ref&lt;HTMLVideoElement | null&gt;(null)

const mediaPlayer = useMediaPlayer({
  type: 'video',
  url: props.videoUrl
})

// Watch for URL changes and recreate player
watch(() =&gt; props.videoUrl, (newUrl) =&gt; {
  // Clean up old player
  if (mediaPlayer.state.value.isPlaying) {
    mediaPlayer.controls.pause()
  }
  
  // Create new player
  const newPlayer = useMediaPlayer({
    type: 'video',
    url: newUrl
  })
  
  // Update references
  mediaPlayer.state.value = newPlayer.state.value
  mediaPlayer.controls = newPlayer.controls
})

// Fullscreen handling
const toggleFullscreen = async () =&gt; {
  if (!videoRef.value) return

  try {
    if (!document.fullscreenElement) {
      await videoRef.value.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  } catch (err) {
    console.error('Error attempting to toggle fullscreen:', err)
  }
}

// Expose methods to parent
defineExpose({
  seek: mediaPlayer.controls.seek,
  seekTo: mediaPlayer.controls.seek
})
&lt;/script&gt;

&lt;style scoped&gt;
/* Hide native video controls */
video::-webkit-media-controls {
  display: none !important;
}
video::-webkit-media-controls-enclosure {
  display: none !important;
}
&lt;/style&gt;
