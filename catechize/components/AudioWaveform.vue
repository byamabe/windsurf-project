<template>
  <canvas ref="canvas" class="w-full h-16"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const props = defineProps<{
  audioUrl: string
  currentTime: number
  duration: number
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
const audioContext = ref<AudioContext | null>(null)
const audioBuffer = ref<AudioBuffer | null>(null)
const isLoading = ref(false)

const drawWaveform = () => {
  if (!canvas.value || !audioBuffer.value) return

  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  // Set canvas dimensions
  canvas.value.width = canvas.value.offsetWidth * window.devicePixelRatio
  canvas.value.height = canvas.value.offsetHeight * window.devicePixelRatio

  // Clear canvas
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

  // Get audio data
  const data = audioBuffer.value.getChannelData(0)
  const step = Math.ceil(data.length / canvas.value.width)
  const amp = canvas.value.height / 2

  // Draw waveform
  ctx.beginPath()
  ctx.strokeStyle = '#3B82F6' // blue-500
  ctx.lineWidth = 2

  const numChunks = Math.ceil(data.length / step)
  for (let i = 0; i < numChunks; i++) {
    let min = Infinity
    let max = -Infinity

    // Find min/max for this chunk
    for (let j = 0; j < step; j++) {
      const datum = data[(i * step) + j]
      if (datum !== undefined) {
        if (datum < min) min = datum
        if (datum > max) max = datum
      }
    }

    // Draw min/max lines
    const x = i
    ctx.moveTo(x, (1 + min) * amp)
    ctx.lineTo(x, (1 + max) * amp)
  }

  ctx.stroke()

  // Draw progress
  const progress = props.currentTime / props.duration
  const progressX = canvas.value.width * progress

  ctx.beginPath()
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)' // blue-500 with opacity
  ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'
  ctx.fillRect(0, 0, progressX, canvas.value.height)
  ctx.stroke()
}

const loadAudio = async () => {
  if (!props.audioUrl) return

  isLoading.value = true
  try {
    const response = await fetch(props.audioUrl)
    const arrayBuffer = await response.arrayBuffer()
    
    if (!audioContext.value) {
      audioContext.value = new AudioContext()
    }
    
    audioBuffer.value = await audioContext.value.decodeAudioData(arrayBuffer)
    drawWaveform()
  } catch (error) {
    console.error('Error loading audio:', error)
  } finally {
    isLoading.value = false
  }
}

// Watch for audio URL changes
watch(() => props.audioUrl, loadAudio, { immediate: true })

// Watch for time updates
watch(() => props.currentTime, drawWaveform)

// Clean up
onMounted(() => {
  window.addEventListener('resize', drawWaveform)
})

onUnmounted(() => {
  window.removeEventListener('resize', drawWaveform)
  if (audioContext.value) {
    audioContext.value.close()
  }
})
</script>
