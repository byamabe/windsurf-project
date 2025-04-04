import { ref, onMounted, onUnmounted, type Ref, watch } from 'vue'
import { loadYouTubeApi, getYouTubeVideoId } from '~/utils/youtube'
import { useMediaProgress } from '~/composables/useMediaProgress'

export interface MediaSource {
  type: 'audio' | 'video' | 'youtube'
  url: string
  id: string
}

export interface TimeRange {
  start: number
  end: number
}

export interface MediaPlayerState {
  currentTime: number
  duration: number
  isPlaying: boolean
  isLoading: boolean
  volume: number
  speed: number
  buffered: TimeRange[]
  error: Error | null
}

export interface MediaPlayerControls {
  play(): Promise<void>
  pause(): void
  togglePlay(): Promise<void>
  seek(time: number): void
  setVolume(volume: number): void
  setSpeed(speed: number): void
  skipForward(seconds?: number): void
  skipBackward(seconds?: number): void
  setMediaElement(element: HTMLMediaElement | null): void
}

interface MediaElements {
  audioElement?: Ref<HTMLAudioElement | null>
  videoElement?: Ref<HTMLVideoElement | null>
}

export type { MediaElements }

export function useMediaPlayer(
  source: MediaSource,
  container?: Ref<HTMLElement | null>,
  elements?: MediaElements
) {
  // State
  const state = ref<MediaPlayerState>({
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    isLoading: true,
    volume: 1,
    speed: 1,
    buffered: [],
    error: null
  })

  // Media element refs
  const audioElement = elements?.audioElement || ref<HTMLAudioElement | null>(null)
  const videoElement = elements?.videoElement || ref<HTMLVideoElement | null>(null)
  const youtubePlayer = ref<any>(null)

  const { updateProgress, getProgress } = useMediaProgress()

  let timeTrackingInterval: number | null = null

  // Save progress when time or duration changes
  watch(
    () => ({ time: state.value.currentTime, duration: state.value.duration }),
    ({ time, duration }) => {
      if (time > 0 && duration > 0) {
        console.log('[useMediaPlayer] Saving progress', {
          type: source.type,
          time,
          duration
        })
        updateProgress(source.id, source.type, time, duration)
      }
    }
  )

  // Controls
  const controls = {
    async play() {
      console.log('[useMediaPlayer] Play called', {
        type: source.type,
        element: source.type === 'audio' ? audioElement?.value : videoElement?.value
      })
      try {
        if (source.type === 'youtube' && youtubePlayer.value) {
          youtubePlayer.value.playVideo()
        } else {
          const element = audioElement?.value || videoElement?.value
          if (element) {
            console.log('[useMediaPlayer] Playing element', { 
              readyState: element.readyState,
              currentTime: element.currentTime,
              paused: element.paused,
              ended: element.ended,
              error: element.error,
              stateCurrentTime: state.value.currentTime
            })
            // Sync currentTime with state before playing
            if (state.value.currentTime > 0 && Math.abs(element.currentTime - state.value.currentTime) > 0.1) {
              console.log('[useMediaPlayer] Syncing currentTime before play:', state.value.currentTime)
              element.currentTime = state.value.currentTime
            }
            await element.play()
          } else {
            console.error('[useMediaPlayer] No media element found')
          }
        }
      } catch (error) {
        console.error('[useMediaPlayer] Play error:', error)
      }
    },

    pause() {
      console.log('[useMediaPlayer] Pause called', {
        type: source.type,
        isPlaying: state.value.isPlaying
      })
      try {
        if (source.type === 'youtube' && youtubePlayer.value) {
          youtubePlayer.value.pauseVideo()
        } else {
          const element = audioElement?.value || videoElement?.value
          if (element) {
            element.pause()
          }
        }
      } catch (error) {
        console.error('[useMediaPlayer] Pause error:', error)
      }
    },

    async togglePlay() {
      console.log('[useMediaPlayer] Toggle play called', {
        type: source.type,
        isPlaying: state.value.isPlaying
      })
      if (state.value.isPlaying) {
        controls.pause()
      } else {
        await controls.play()
      }
    },

    seek(time: number) {
      console.log('[useMediaPlayer] Seek called', {
        type: source.type,
        time,
        currentTime: state.value.currentTime,
        duration: state.value.duration
      })
      try {
        // If time is between 0 and 1, treat it as a percentage
        const targetTime = time <= 1 ? time * state.value.duration : time

        if (source.type === 'youtube' && youtubePlayer.value) {
          youtubePlayer.value.seekTo(targetTime, true)
          state.value.currentTime = targetTime
        } else {
          const element = audioElement?.value || videoElement?.value
          if (element) {
            console.log('[useMediaPlayer] Seeking element', {
              readyState: element.readyState,
              currentTime: element.currentTime,
              duration: element.duration,
              targetTime
            })
            element.currentTime = targetTime
            state.value.currentTime = targetTime
            updateProgress(source.id, source.type, state.value.currentTime, state.value.duration)
          }
        }
      } catch (error) {
        console.error('[useMediaPlayer] Seek error:', error)
      }
    },

    setVolume(volume: number) {
      console.log('[useMediaPlayer] Set volume called', {
        type: source.type,
        volume
      })
      try {
        if (source.type === 'youtube' && youtubePlayer.value) {
          youtubePlayer.value.setVolume(volume * 100)
        } else {
          const element = audioElement?.value || videoElement?.value
          if (element) {
            element.volume = volume
          }
        }
        state.value.volume = volume
      } catch (error) {
        console.error('[useMediaPlayer] Volume error:', error)
      }
    },

    setSpeed(speed: number) {
      console.log('[useMediaPlayer] Set speed called', {
        type: source.type,
        speed
      })
      try {
        if (source.type === 'youtube' && youtubePlayer.value) {
          youtubePlayer.value.setPlaybackRate(speed)
        } else {
          const element = audioElement?.value || videoElement?.value
          if (element) {
            element.playbackRate = speed
          }
        }
        state.value.speed = speed
      } catch (error) {
        console.error('[useMediaPlayer] Speed error:', error)
      }
    },

    skipForward(seconds: number = 10) {
      console.log('[useMediaPlayer] Skip forward called', {
        type: source.type,
        seconds
      })
      controls.seek(state.value.currentTime + seconds)
    },

    skipBackward(seconds: number = 10) {
      console.log('[useMediaPlayer] Skip backward called', {
        type: source.type,
        seconds
      })
      controls.seek(state.value.currentTime - seconds)
    },

    setMediaElement(element: HTMLMediaElement | null) {
      console.log('[useMediaPlayer] Setting media element', {
        type: source.type,
        element
      })

      if (!element) return

      if (source.type === 'audio') {
        audioElement.value = element as HTMLAudioElement
      } else if (source.type === 'video') {
        videoElement.value = element as HTMLVideoElement
      }

      // Set up event listeners
      let canPlayHandled = false

      element.addEventListener('loadstart', () => {
        console.log(`[useMediaPlayer] ${source.type} loadstart`)
      })

      element.addEventListener('loadedmetadata', () => {
        console.log(`[useMediaPlayer] ${source.type} loadedmetadata`, {
          duration: element.duration,
          readyState: element.readyState
        })
        if (element.duration && !isNaN(element.duration)) {
          state.value.duration = element.duration
        }
        state.value.isLoading = false
      })
      
      element.addEventListener('timeupdate', () => {
        // Update time regardless of play state to handle seeking
        state.value.currentTime = element.currentTime
        updateProgress(source.id, source.type, state.value.currentTime, state.value.duration)
      })
      
      element.addEventListener('durationchange', () => {
        console.log(`[useMediaPlayer] ${source.type} durationchange`, {
          duration: element.duration
        })
        if (element.duration && !isNaN(element.duration)) {
          state.value.duration = element.duration
          updateProgress(source.id, source.type, state.value.currentTime, element.duration)
        }
      })
      
      element.addEventListener('play', () => {
        console.log(`[useMediaPlayer] ${source.type} play`)
        state.value.isPlaying = true
        state.value.isLoading = false
      })
      
      element.addEventListener('pause', () => {
        console.log(`[useMediaPlayer] ${source.type} pause`)
        state.value.isPlaying = false
      })
      
      element.addEventListener('waiting', () => {
        console.log(`[useMediaPlayer] ${source.type} waiting`)
        state.value.isLoading = true
      })
      
      element.addEventListener('canplay', () => {
        // Only handle canplay once to avoid infinite loops
        if (!canPlayHandled) {
          console.log(`[useMediaPlayer] ${source.type} canplay`, {
            readyState: element.readyState,
            duration: element.duration,
            stateCurrentTime: state.value.currentTime
          })
          state.value.isLoading = false
          
          // Set initial time if we have saved progress
          if (state.value.currentTime > 0) {
            console.log(`[useMediaPlayer] Restoring ${source.type} time to:`, state.value.currentTime)
            element.currentTime = state.value.currentTime
          }
          
          canPlayHandled = true
        }
      })
      
      element.addEventListener('error', () => {
        const error = element.error
        console.error(`[useMediaPlayer] ${source.type} error`, {
          code: error?.code,
          message: error?.message
        })
        state.value.error = new Error(`${source.type} loading error`)
        state.value.isLoading = false
      })

      // Set initial volume and speed
      element.volume = state.value.volume
      element.playbackRate = state.value.speed
    }
  } as const

  // Initialize media element based on source type
  onMounted(async () => {
    console.log('[useMediaPlayer] Mounting', {
      type: source.type,
      url: source.url
    })

    // Load saved progress
    const savedProgress = getProgress(source.id, source.type)
    if (savedProgress) {
      state.value.currentTime = savedProgress.currentTime
      state.value.duration = savedProgress.duration
    }

    if (source.type === 'youtube' && container?.value) {
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
              console.log('[useMediaPlayer] YouTube player ready')
              state.value.isLoading = false
              state.value.duration = youtubePlayer.value.getDuration()
              const savedProgress = getProgress(source.id, source.type)
              if (savedProgress) {
                youtubePlayer.value.seekTo(savedProgress.currentTime, true)
                state.value.currentTime = savedProgress.currentTime
              }
            },
            onStateChange: (event) => {
              console.log('[useMediaPlayer] YouTube player state change', {
                state: event.data
              })
              switch (event.data) {
                case window.YT.PlayerState.PLAYING:
                  console.log('[useMediaPlayer] YouTube player playing')
                  state.value.isPlaying = true
                  state.value.isLoading = false
                  // Start time tracking
                  if (!timeTrackingInterval) {
                    timeTrackingInterval = window.setInterval(() => {
                      if (youtubePlayer.value?.getCurrentTime) {
                        state.value.currentTime = youtubePlayer.value.getCurrentTime()
                        updateProgress(source.id, source.type, state.value.currentTime, state.value.duration)
                      }
                    }, 250)
                  }
                  break
                case window.YT.PlayerState.PAUSED:
                  console.log('[useMediaPlayer] YouTube player paused')
                  state.value.isPlaying = false
                  state.value.isLoading = false
                  if (timeTrackingInterval) {
                    window.clearInterval(timeTrackingInterval)
                    timeTrackingInterval = null
                  }
                  break
                case window.YT.PlayerState.BUFFERING:
                  console.log('[useMediaPlayer] YouTube player buffering')
                  state.value.isLoading = true
                  break
                case window.YT.PlayerState.ENDED:
                  console.log('[useMediaPlayer] YouTube player ended')
                  state.value.isPlaying = false
                  state.value.isLoading = false
                  if (timeTrackingInterval) {
                    window.clearInterval(timeTrackingInterval)
                    timeTrackingInterval = null
                  }
                  break
              }
            },
            onError: () => {
              console.error('[useMediaPlayer] YouTube player error')
              state.value.error = new Error('YouTube player error')
              state.value.isLoading = false
            }
          }
        })
      } catch (error) {
        console.error('[useMediaPlayer] YouTube error:', error)
        state.value.error = error as Error
        state.value.isLoading = false
      }
    }
  })

  // Cleanup
  onUnmounted(() => {
    if (timeTrackingInterval) {
      window.clearInterval(timeTrackingInterval)
      timeTrackingInterval = null
    }
  })

  return {
    state,
    controls
  }
}
