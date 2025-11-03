<template>
  <div class="items-center justify-center w-full">
    <div v-if="videoWithAudioSource">
      <video
        ref="videoWithAudioRef"
        :src="videoWithAudioSource"
        class="mulmocast-video mx-auto h-auto max-h-[80vh] w-auto object-contain"
        :controls="true"
        playsinline="true"
        @play="handlePlay"
        @pause="handlePause"
        @ended="handleEnded"
        />
    </div>
    <div v-else-if="soundEffectSource || videoSource" class="relative inline-block">
      <video
        ref="videoRef"
        class="mulmocast-video mx-auto h-auto max-h-[80vh] w-auto object-contain"
        :src="soundEffectSource || videoSource"
        :controls="true"
        playsinline="true"
        @play="handleVideoPlay"
        @pause="handleVideoPause"
        @ended="handleVideoEnd"
      />
      <audio
        v-if="audioSource"
        ref="audioSyncRef"
        :src="audioSource"
        :controls="true"
        class="hidden"
        @ended="handleAudioEnd"
      />
    </div>
    <div v-else-if="audioSource" class="relative inline-block">
      <img
        v-if="imageSource"
        :src="imageSource"
        class="mx-auto h-auto max-h-[80vh] w-auto object-contain"
        alt="Background"
      />
      <img
        v-else
        :src="mulmoImage"
        class="mx-auto h-auto max-h-[80vh] w-auto object-contain"
        alt="Background"
      />
      <audio
        ref="audioRef"
        class="mulmocast-audio absolute inset-0 w-full h-full"
        :src="audioSource"
        :controls="true"
        @play="handlePlay"
        @pause="handlePause"
        @ended="handleEnded"
      />
    </div>
    <div v-else-if="imageSource" class="relative inline-block">
      <img ref="imageRef" :src="imageSource" class="max-w-full max-h-full object-contain" />
    </div>
    <div v-else>No media available</div>
    <div v-if="text" class="mt-4 px-6 py-4 text-center">
      <p class="text-lg leading-relaxed font-sans text-gray-800">
        {{ text }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';
import { sleep } from './utils';
interface Props {
  index: number;
  videoWithAudioSource?: string;
  soundEffectSource?: string;
  videoSource?: string;
  imageSource?: string;
  audioSource?: string;
  text?: string;
  duration?: number;
  defaultLang?: string;
  currentLang?: string;
}
const props = defineProps<Props>();

const mulmoImage =
  'https://github.com/receptron/mulmocast-cli/blob/main/assets/images/mulmocast_credit.png?raw=true';

const emit = defineEmits(['play', 'pause', 'ended']);

const videoWithAudioRef = ref<HTMLVideoElement>();
const videoRef = ref<HTMLVideoElement>();
const audioSyncRef = ref<HTMLAudioElement>();
const audioRef = ref<HTMLAudioElement>();
const imageRef = ref<HTMLImageElement>();

// Control video volume based on language match
const updateVideoVolume = () => {
  console.log('updateVideoVolume called:', {
    hasVideoRef: !!videoRef.value,
    videoSource: props.videoSource,
    audioSource: props.audioSource,
    currentLang: props.currentLang,
    defaultLang: props.defaultLang,
  });

  if (videoRef.value && props.videoSource) {
    // Default: mute video (volume = 0)
    // If audioSource exists and language is different from default, set volume to 0.2
    if (props.audioSource && props.currentLang && props.defaultLang && props.currentLang !== props.defaultLang) {
      console.log('Setting volume to 0.2');
      videoRef.value.volume = 0.2;
    } else {
      console.log('Setting volume to 0');
      videoRef.value.volume = 0;
    }
    console.log('Actual volume:', videoRef.value.volume);
  }
};

// Watch for language or source changes
watch([() => props.currentLang, () => props.defaultLang, () => props.videoSource, () => props.audioSource], () => {
  updateVideoVolume();
});

// Watch for videoRef to be ready
watch(videoRef, (newVal) => {
  if (newVal) {
    console.log('videoRef is now available');
    updateVideoVolume();
  }
});

// Update volume on mount
onMounted(() => {
  console.log('Component mounted');
  updateVideoVolume();
});

const handleVideoPlay = () => {
  shouldBePlaying.value = true;
  if (audioSyncRef.value && videoRef.value) {
    audioSyncRef.value.currentTime = videoRef.value.currentTime;
    if (audioSyncRef.value.currentTime === videoRef.value.currentTime) {
      void audioSyncRef.value.play();
    }
  }
  emit('play');
};
const handleVideoPause = (e: Event) => {
  // Don't update shouldBePlaying if paused by browser in background
  if (!document.hidden) {
    shouldBePlaying.value = false;
  }
  // If the video is not at the end, it is determined to be a human operation.
  if (!videoRef.value?.ended && audioSyncRef?.value) {
    audioSyncRef.value?.pause();
  }
  console.log(e);
  handlePause(e);
};

//
const handleVideoEnd = () => {
  const audioPlaying =
    !audioSyncRef.value?.paused &&
    !audioSyncRef.value?.ended &&
    (audioSyncRef.value?.currentTime ?? 0) > 0;
  if (!audioPlaying) {
    handleEnded();
  }
};
const handleAudioEnd = () => {
  const audioPlaying =
    !videoRef.value?.paused && !videoRef.value?.ended && (videoRef.value?.currentTime ?? 0) > 0;
  if (!audioPlaying) {
    handleEnded();
  }
};

const handlePlay = () => {
  shouldBePlaying.value = true;
  emit('play');
};

const handlePause = (e: Event) => {
  // Don't update shouldBePlaying if paused by browser in background
  if (!document.hidden) {
    shouldBePlaying.value = false;
  }
  const video = e.target as HTMLVideoElement;
  // It also fires on the end event, so pause is not sent in that case.
  if (video.duration !== video.currentTime) {
    emit('pause');
  }
};
const handleEnded = () => {
  shouldBePlaying.value = false;
  emit('ended');
};
/*
const videoControlsEnabled = computed(() => {
  console.log(props.audioSource);
  return !props.audioSource;
});
*/

// Track if media should be playing
const shouldBePlaying = ref(false);
let keepAliveInterval: ReturnType<typeof setInterval> | null = null;

const play = async () => {
  shouldBePlaying.value = true;
  if (videoWithAudioRef.value) {
    void videoWithAudioRef.value.play();
  }
  if (videoRef.value) {
    // Set volume before playing
    updateVideoVolume();
    void videoRef.value.play();
    // Also play the synced audio if it exists
    if (audioSyncRef.value) {
      audioSyncRef.value.currentTime = videoRef.value.currentTime;
      void audioSyncRef.value.play();
    }
  }
  if (audioRef.value) {
    void audioRef.value.play();
  }
  if (!videoWithAudioRef.value && !videoRef.value && !audioRef.value) {
    await sleep((props.duration ?? 0) * 1000);
    shouldBePlaying.value = false;
    emit('ended');
  }
};

// Resume playback helper
const resumePlayback = () => {
  if (!shouldBePlaying.value) return;

  if (videoWithAudioRef.value?.paused) {
    void videoWithAudioRef.value.play().catch(() => {/* ignore */});
  }
  if (videoRef.value?.paused) {
    void videoRef.value.play().catch(() => {/* ignore */});
  }
  if (audioRef.value?.paused) {
    void audioRef.value.play().catch(() => {/* ignore */});
  }
  if (audioSyncRef.value?.paused) {
    void audioSyncRef.value.play().catch(() => {/* ignore */});
  }
};

// Handle background tab - prevent pause when tab becomes hidden
const handleVisibilityChange = () => {
  if (document.hidden && shouldBePlaying.value) {
    // Start aggressive keep-alive when tab is hidden
    if (!keepAliveInterval) {
      keepAliveInterval = setInterval(resumePlayback, 500);
    }
  } else if (!document.hidden) {
    // Stop keep-alive when tab is visible
    if (keepAliveInterval) {
      clearInterval(keepAliveInterval);
      keepAliveInterval = null;
    }
  }
};

// Listen for pause events to resume immediately
const handleForcedPause = () => {
  if (document.hidden && shouldBePlaying.value) {
    setTimeout(resumePlayback, 50);
  }
};

onMounted(() => {
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Add pause listeners to all media elements
  videoWithAudioRef.value?.addEventListener('pause', handleForcedPause);
  videoRef.value?.addEventListener('pause', handleForcedPause);
  audioRef.value?.addEventListener('pause', handleForcedPause);
  audioSyncRef.value?.addEventListener('pause', handleForcedPause);
});

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange);

  // Clean up pause listeners
  videoWithAudioRef.value?.removeEventListener('pause', handleForcedPause);
  videoRef.value?.removeEventListener('pause', handleForcedPause);
  audioRef.value?.removeEventListener('pause', handleForcedPause);
  audioSyncRef.value?.removeEventListener('pause', handleForcedPause);

  // Clean up interval
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }
});

defineExpose({
  play,
});
</script>
