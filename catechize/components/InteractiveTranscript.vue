<template>
  <div class="transcript-container">
    <div 
      v-for="(segment, index) in parsedTranscript" 
      :key="index" 
      class="segment mb-6"
      :class="{
        'seeking': seekingIndex === index,
        'current': isCurrentSegment(segment)
      }"
      ref="segments"
    >
      <!-- Speaker name -->
      <div class="text-lg font-semibold text-blue-400 mb-1">
        {{ segment.speaker }}
      </div>
      
      <!-- Timestamp -->
      <div 
        class="text-sm text-gray-400 mb-2 cursor-pointer hover:text-blue-400"
        @click="handleSeek(segment.startTime, index)"
      >
        {{ formatTimeRange(segment.startTime, segment.endTime) }}
      </div>
      
      <!-- Text content -->
      <div class="text-gray-200">
        {{ segment.text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface TranscriptSegment {
  startTime: number;    // in seconds
  endTime: number;      // in seconds
  text: string;
  speaker: string;
}

const props = defineProps<{
  transcript: string;
  currentTime?: number; // New prop for current playback time
}>();

const emit = defineEmits<{
  (e: 'seek', time: number): void;
}>();

const seekingIndex = ref<number | null>(null);
const segments = ref<HTMLElement[]>([]);

// Check if a segment is currently being played
const isCurrentSegment = (segment: TranscriptSegment): boolean => {
  if (!props.currentTime) return false;
  return props.currentTime >= segment.startTime && props.currentTime <= segment.endTime;
};

// Parse MM:SS format to seconds
const parseTimeToSeconds = (timeStr: string): number => {
  const parts = timeStr.trim().split(':').map(Number);
  if (parts.length !== 2) return 0;
  return (parts[0] || 0) * 60 + (parts[1] || 0);
};

// Format seconds to MM:SS
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Format time range
const formatTimeRange = (start: number, end: number): string => {
  return `${formatTime(start)} - ${formatTime(end)}`;
};

// Handle seeking with visual feedback
const handleSeek = (time: number, index: number) => {
  seekingIndex.value = index;
  
  // Scroll the segment into view
  if (segments.value[index]) {
    segments.value[index].scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });
  }
  
  // Emit seek event
  emit('seek', time);
  
  // Remove highlight after animation
  setTimeout(() => {
    seekingIndex.value = null;
  }, 1500); // Duration matches CSS animation
};

// Watch current time and scroll current segment into view
watch(() => props.currentTime, (newTime) => {
  if (!newTime) return;
  
  // Find current segment index
  const currentIndex = parsedTranscript.value.findIndex(
    segment => newTime >= segment.startTime && newTime <= segment.endTime
  );
  
  // If found, scroll into view
  if (currentIndex !== -1 && segments.value[currentIndex]) {
    segments.value[currentIndex].scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center'
    });
  }
}, { immediate: true });

// Parse the transcript text into segments
const parsedTranscript = computed(() => {
  return parseTranscript(props.transcript);
});

const parseTranscript = (text: string): TranscriptSegment[] => {
  const segments: TranscriptSegment[] = [];
  const lines = text.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]?.trim() || '';
    if (!line) continue;
    
    // If we have at least 3 more lines and the second line contains a time range
    const nextLine = lines[i + 1]?.trim() || '';
    if (i + 2 < lines.length && nextLine.includes('-')) {
      const speaker = line;
      const timeRange = nextLine;
      
      // Parse time range
      const timeParts = timeRange.split('-');
      const startStr = timeParts[0]?.trim() || '0:00';
      const endStr = timeParts[1]?.trim() || '0:00';
      const startTime = parseTimeToSeconds(startStr);
      const endTime = parseTimeToSeconds(endStr);
      
      const text = lines[i + 2]?.trim() || '';
      
      segments.push({
        speaker,
        startTime,
        endTime,
        text
      });
      
      // Skip the processed lines
      i += 2;
    }
  }
  
  return segments;
};
</script>

<style scoped>
.transcript-container {
  max-width: 100%;
  padding: 1rem;
}

.segment {
  border-left: 2px solid transparent;
  padding-left: 1rem;
  transition: all 0.3s ease;
  position: relative;
  background: transparent;
}

.segment:hover {
  border-left-color: theme('colors.blue.400');
}

.segment.seeking {
  border-left-color: theme('colors.blue.400');
  background: theme('colors.blue.900' / 20%);
  animation: highlight 1.5s ease-out;
}

.segment.current {
  border-left-color: theme('colors.green.400');
  background: theme('colors.green.900' / 10%);
}

@keyframes highlight {
  0% {
    background: theme('colors.blue.900' / 40%);
  }
  100% {
    background: theme('colors.blue.900' / 0%);
  }
}
</style>
