import { ref, onMounted, onUnmounted, watch } from 'vue'
import { loadYouTubeApi, getYouTubeVideoId } from '../utils/youtube'

export interface MediaSource {
  type: 'audio' | 'video' | 'youtube'
  url: string
}

export interface TimeRange {
  start: number
  end: number
}

export interface MediaPlayerState {
  currentTime: number
  duration: number
  isPlaying: boolean
  volume: number
  speed: number
  buffered: TimeRange[]
  isLoading: boolean
  error: Error | null
}

export interface MediaPlayerControls {
  play: () => Promise<void>
  pause: () => void
  togglePlay: () => Promise<void>
  seek: (time: number) => void
  setVolume: (volume: number) => void
  setSpeed: (speed: number) => void
  skipForward: (seconds?: number) => void
  skipBackward: (seconds?: number) => void
}

export function useMediaPlayer(source: MediaSource, container?: Ref<HTMLElement | null>) {
  // State
  const state = ref<MediaPlayerState>({
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    volume: 1,
    speed: 1,
    buffered: [],
    isLoading: true,
    error: null
  })

  // Media element refs
  const audioElement = ref<HTMLAudioElement | null>(null)
  const videoElement = ref<HTMLVideoElement | null>(null)
  const youtubePlayer = ref<any>(null)

  // Internal state
  let timeTrackingInterval: number | null = null

  // Common functionality
  const formatTime = (time: number): string => {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const startTimeTracking = () => {
    if (timeTrackingInterval) return
    timeTrackingInterval = window.setInterval(() => {
      if (source.type === 'youtube' && youtubePlayer.value?.getCurrentTime) {
        state.value.currentTime = youtubePlayer.value.getCurrentTime()
      }
    }, 1000)
  }

  const stopTimeTracking = () => {
    if (timeTrackingInterval) {
      window.clearInterval(timeTrackingInterval)
      timeTrackingInterval = null
    }
  }

  // Media element event handlers
  const handleTimeUpdate = (time?: number) => {
    if (time !== undefined) {
      state.value.currentTime = time
    } else if (audioElement.value) {
      state.value.currentTime = audioElement.value.currentTime
    } else if (videoElement.value) {
      state.value.currentTime = videoElement.value.currentTime
    }
  }

  const handleDurationChange = () => {
    if (audioElement.value) {
      state.value.duration = audioElement.value.duration
    } else if (videoElement.value) {
      state.value.duration = videoElement.value.duration
    }
  }

  const handleProgress = () => {
    const element = audioElement.value || videoElement.value
    if (!element) return

    const ranges: TimeRange[] = []
    for (let i = 0; i < element.buffered.length; i++) {
      ranges.push({
        start: element.buffered.start(i),
        end: element.buffered.end(i)
      })
    }
    state.value.buffered = ranges
  }

  const handleError = (error: Error) => {
    state.value.error = error
    state.value.isLoading = false
  }

  // Controls
  const controls: MediaPlayerControls = {
    async play() {
      try {
        state.value.isLoading = true
        if (source.type === 'youtube' && youtubePlayer.value) {
          youtubePlayer.value.playVideo()
        } else {
          const element = audioElement.value || videoElement.value
          if (element) {
            await element.play()
          }
        }
        state.value.isPlaying = true
        startTimeTracking()
      } catch (error) {
        handleError(error as Error)
      } finally {
        state.value.isLoading = false
      }
    },

    pause() {
      if (source.type === 'youtube' && youtubePlayer.value) {
        youtubePlayer.value.pauseVideo()
      } else {
        const element = audioElement.value || videoElement.value
        if (element) {
          element.pause()
        }
      }
      state.value.isPlaying = false
      stopTimeTracking()
    },

    async togglePlay() {
      if (state.value.isPlaying) {
        controls.pause()
      } else {
        await controls.play()
      }
    },

    seek(time: number) {
      if (time < 0) time = 0
      if (time > state.value.duration) time = state.value.duration

      if (source.type === 'youtube' && youtubePlayer.value) {
        youtubePlayer.value.seekTo(time, true)
      } else {
        const element = audioElement.value || videoElement.value
        if (element) {
          element.currentTime = time
        }
      }
      handleTimeUpdate(time)
    },

    setVolume(volume: number) {
      if (volume < 0) volume = 0
      if (volume > 1) volume = 1

      if (source.type === 'youtube' && youtubePlayer.value) {
        youtubePlayer.value.setVolume(volume * 100)
      } else {
        const element = audioElement.value || videoElement.value
        if (element) {
          element.volume = volume
        }
      }
      state.value.volume = volume
    },

    setSpeed(speed: number) {
      if (source.type === 'youtube' && youtubePlayer.value) {
        youtubePlayer.value.setPlaybackRate(speed)
      } else {
        const element = audioElement.value || videoElement.value
        if (element) {
          element.playbackRate = speed
        }
      }
      state.value.speed = speed
    },

    skipForward(seconds = 15) {
      controls.seek(state.value.currentTime + seconds)
    },

    skipBackward(seconds = 15) {
      controls.seek(state.value.currentTime - seconds)
    }
  }

  // Initialize media element based on source type
  onMounted(async () => {
    if (source.type === 'audio') {
      audioElement.value = new Audio(source.url)
      audioElement.value.preload = 'metadata'
      
      audioElement.value.addEventListener('timeupdate', () => handleTimeUpdate())
      audioElement.value.addEventListener('durationchange', handleDurationChange)
      audioElement.value.addEventListener('progress', handleProgress)
      audioElement.value.addEventListener('waiting', () => state.value.isLoading = true)
      audioElement.value.addEventListener('canplay', () => state.value.isLoading = false)
      audioElement.value.addEventListener('error', (e) => handleError(new Error('Audio loading error')))
    } else if (source.type === 'video') {
      videoElement.value = document.createElement('video')
      videoElement.value.src = source.url
      videoElement.value.preload = 'metadata'
      
      videoElement.value.addEventListener('timeupdate', () => handleTimeUpdate())
      videoElement.value.addEventListener('durationchange', handleDurationChange)
      videoElement.value.addEventListener('progress', handleProgress)
      videoElement.value.addEventListener('waiting', () => state.value.isLoading = true)
      videoElement.value.addEventListener('canplay', () => state.value.isLoading = false)
      videoElement.value.addEventListener('error', (e) => handleError(new Error('Video loading error')))
      
      if (container?.value) {
        container.value.appendChild(videoElement.value)
      }
    } else if (source.type === 'youtube' && container?.value) {
      try {
        await loadYouTubeApi()
        const videoId = getYouTubeVideoId(source.url)
        
        youtubePlayer.value = new window.YT.Player(container.value, {
          videoId,
          playerVars: {
            autoplay: 0,
            modestbranding: 1,
            playsinline: 1,
            rel: 0
          },
          events: {
            onReady: () => {
              state.value.isLoading = false
              state.value.duration = youtubePlayer.value.getDuration()
            },
            onStateChange: (event) => {
              const PlayerState = {
                PLAYING: 1,
                PAUSED: 2,
                BUFFERING: 3,
                ENDED: 0
              } as const;

              switch (event.data) {
                case PlayerState.PLAYING:
                  state.value.isPlaying = true
                  state.value.isLoading = false
                  startTimeTracking()
                  break
                case PlayerState.PAUSED:
                  state.value.isPlaying = false
                  stopTimeTracking()
                  break
                case PlayerState.BUFFERING:
                  state.value.isLoading = true
                  break
                case PlayerState.ENDED:
                  state.value.isPlaying = false
                  stopTimeTracking()
                  break
              }
            },
            onError: () => handleError(new Error('YouTube player error'))
          }
        })
      } catch (error) {
        handleError(error as Error)
      }
    }
  })

  // Cleanup
  onUnmounted(() => {
    stopTimeTracking()
    
    if (audioElement.value) {
      audioElement.value.pause()
      audioElement.value.src = ''
      audioElement.value.remove()
    }
    
    if (videoElement.value) {
      videoElement.value.pause()
      videoElement.value.src = ''
      videoElement.value.remove()
    }
    
    if (youtubePlayer.value) {
      youtubePlayer.value.destroy()
    }
  })

  return {
    state,
    controls,
    formatTime
  }
}
