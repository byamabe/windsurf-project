import { ref, watch } from 'vue'

export interface MediaProgress {
  id: string                 // Unique identifier for the media (e.g., episode ID)
  type: 'audio' | 'video' | 'youtube'
  currentTime: number        // Current playback position
  duration: number          // Total duration
  lastUpdated: string       // ISO timestamp of last update
  completed: boolean        // Whether the media has been completed
}

// Separate storage keys for different media types
const STORAGE_KEYS = {
  audio: 'media_progress_audio',
  video: 'media_progress_video',
  youtube: 'media_progress_youtube'
} as const

const COMPLETION_THRESHOLD = 0.9 // Consider media completed at 90%

export function useMediaProgress() {
  const progress = {
    audio: ref<Record<string, MediaProgress>>({}),
    video: ref<Record<string, MediaProgress>>({}),
    youtube: ref<Record<string, MediaProgress>>({})
  }

  // Load saved progress from localStorage for each type
  const loadProgress = () => {
    try {
      Object.entries(STORAGE_KEYS).forEach(([type, key]) => {
        const saved = localStorage.getItem(key)
        if (saved) {
          progress[type as keyof typeof STORAGE_KEYS].value = JSON.parse(saved)
        }
      })
    } catch (error) {
      console.error('Error loading media progress:', error)
    }
  }

  // Save progress to localStorage for a specific type
  const saveProgress = (type: keyof typeof STORAGE_KEYS) => {
    try {
      localStorage.setItem(
        STORAGE_KEYS[type],
        JSON.stringify(progress[type].value)
      )
    } catch (error) {
      console.error('Error saving media progress:', error)
    }
  }

  // Update progress for a specific media item
  const updateProgress = (
    id: string,
    type: keyof typeof STORAGE_KEYS,
    currentTime: number,
    duration: number
  ) => {
    if (!id || currentTime < 0 || duration <= 0) return

    console.log('[useMediaProgress] Updating progress', {
      id,
      type,
      currentTime,
      duration
    })
    
    const completed = duration > 0 && (currentTime / duration) >= COMPLETION_THRESHOLD

    progress[type].value[id] = {
      id,
      type,
      currentTime,
      duration,
      lastUpdated: new Date().toISOString(),
      completed
    }

    saveProgress(type)
  }

  // Get progress for a specific media item
  const getProgress = (id: string, type: keyof typeof STORAGE_KEYS): MediaProgress | null => {
    return progress[type].value[id] || null
  }

  // Clear progress for a specific media item
  const clearProgress = (id: string, type: keyof typeof STORAGE_KEYS) => {
    delete progress[type].value[id]
    saveProgress(type)
  }

  // Clear all progress for a specific type
  const clearTypeProgress = (type: keyof typeof STORAGE_KEYS) => {
    progress[type].value = {}
    saveProgress(type)
  }

  // Clear all progress
  const clearAllProgress = () => {
    Object.keys(STORAGE_KEYS).forEach((type) => {
      clearTypeProgress(type as keyof typeof STORAGE_KEYS)
    })
  }

  // Get all completed media items for a type
  const getCompletedMedia = (type: keyof typeof STORAGE_KEYS): MediaProgress[] => {
    return Object.values(progress[type].value).filter(item => item.completed)
  }

  // Get all in-progress media items (not completed) for a type
  const getInProgressMedia = (type: keyof typeof STORAGE_KEYS): MediaProgress[] => {
    return Object.values(progress[type].value).filter(item => !item.completed)
  }

  // Initialize by loading saved progress
  loadProgress()

  return {
    updateProgress,
    getProgress,
    clearProgress,
    clearTypeProgress,
    clearAllProgress,
    getCompletedMedia,
    getInProgressMedia
  }
}
