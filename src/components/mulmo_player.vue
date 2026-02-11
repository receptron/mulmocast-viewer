<template>
  <div class="items-center justify-center w-full">
    <div v-if="videoWithAudioSource" class="group relative">
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
      <div
        class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
      >
        <button
          class="pointer-events-auto w-16 h-16 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors cursor-pointer"
          @click="showPauseButton ? pauseMedia() : play()"
        >
          <svg v-if="!showPauseButton" class="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          <svg v-else class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        </button>
      </div>
    </div>
    <div v-else-if="soundEffectSource || videoSource" class="group relative inline-block">
      <video
        ref="videoRef"
        class="mulmocast-video mx-auto h-auto max-h-[80vh] w-auto object-contain"
        :src="soundEffectSource || videoSource"
        :controls="true"
        playsinline="true"
        @play="handleVideoPlay"
        @pause="handleVideoPause"
        @ended="handleVideoEnd"
        @seeked="handleVideoSeeked"
      />
      <audio
        v-if="audioSource"
        ref="audioSyncRef"
        :src="audioSource"
        :controls="true"
        class="hidden"
        @ended="handleAudioEnd"
      />
      <div
        class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
      >
        <button
          class="pointer-events-auto w-16 h-16 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors cursor-pointer"
          @click="showPauseButton ? pauseMedia() : play()"
        >
          <svg v-if="!showPauseButton" class="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          <svg v-else class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        </button>
      </div>
    </div>
    <div v-else-if="audioSource" class="group relative inline-block">
      <img
        v-if="imageSource"
        :src="imageSource"
        class="mx-auto h-auto max-h-[80vh] w-auto object-contain"
        alt="Background"
      />
      <img v-else :src="mulmoImage" class="mx-auto h-auto max-h-[80vh] w-auto object-contain" alt="Background" />
      <audio
        ref="audioRef"
        class="mulmocast-audio absolute inset-0 w-full h-full"
        :src="audioSource"
        :controls="true"
        @play="handlePlay"
        @pause="handlePause"
        @ended="handleEnded"
      />
      <div
        class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
      >
        <button
          class="pointer-events-auto w-16 h-16 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors cursor-pointer"
          @click="showPauseButton ? pauseMedia() : play()"
        >
          <svg v-if="!showPauseButton" class="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          <svg v-else class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        </button>
      </div>
    </div>
    <div v-else-if="imageSource" class="group relative inline-block">
      <img :src="imageSource" class="max-w-full max-h-full object-contain" />
      <div
        class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
      >
        <button
          class="pointer-events-auto w-16 h-16 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors cursor-pointer"
          @click="showPauseButton ? pauseMedia() : play()"
        >
          <svg v-if="!showPauseButton" class="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          <svg v-else class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        </button>
      </div>
    </div>
    <div v-else>No media available</div>
    <div v-if="text" class="mt-4 px-6 py-4 text-left">
      <p class="text-lg leading-relaxed font-sans text-gray-800">
        {{ text }}
      </p>
      <p
        v-if="originalText && originalText !== text"
        class="text-base leading-relaxed font-sans text-gray-400 mt-3 italic"
      >
        {{ originalText }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { cancellableSleep } from './utils';
export interface MulmoPlayerProps {
  index: number;
  videoWithAudioSource?: string;
  soundEffectSource?: string;
  videoSource?: string;
  imageSource?: string;
  audioSource?: string;
  text?: string;
  originalText?: string;
  duration?: number;
  defaultLang?: string;
  currentLang?: string;
  playbackSpeed?: number;
}
const props = withDefaults(defineProps<MulmoPlayerProps>(), {
  playbackSpeed: 1,
});

const mulmoImage = 'https://github.com/receptron/mulmocast-cli/blob/main/assets/images/mulmocast_credit.png?raw=true';

const emit = defineEmits(['play', 'pause', 'ended']);

const videoWithAudioRef = ref<HTMLVideoElement>();
const videoRef = ref<HTMLVideoElement>();
const audioSyncRef = ref<HTMLAudioElement>();
const audioRef = ref<HTMLAudioElement>();

// Control video volume based on media pattern
const updateVideoVolume = () => {
  if (!videoRef.value) return;
  // soundEffectSource: the video IS the sound content, play at full volume
  if (props.soundEffectSource) {
    videoRef.value.volume = 1;
    return;
  }
  // videoSource: mute video audio by default (narration comes from audioSyncRef)
  // If audioSource exists and language differs from default, play video audio softly as background
  if (props.videoSource) {
    if (props.audioSource && props.currentLang && props.defaultLang && props.currentLang !== props.defaultLang) {
      videoRef.value.volume = 0.2;
    } else {
      videoRef.value.volume = 0;
    }
  }
};

// Update playback speed for all media elements
const updatePlaybackSpeed = () => {
  const speed = props.playbackSpeed ?? 1;
  if (videoWithAudioRef.value) {
    videoWithAudioRef.value.playbackRate = speed;
  }
  if (videoRef.value) {
    videoRef.value.playbackRate = speed;
  }
  if (audioSyncRef.value) {
    audioSyncRef.value.playbackRate = speed;
  }
  if (audioRef.value) {
    audioRef.value.playbackRate = speed;
  }
};

// Watch for language or source changes
watch([() => props.currentLang, () => props.defaultLang, () => props.videoSource, () => props.audioSource], () => {
  updateVideoVolume();
});

// Watch for playback speed changes
watch(
  () => props.playbackSpeed,
  () => {
    updatePlaybackSpeed();
  }
);

// Watch for videoRef to be ready
watch(videoRef, (newVal) => {
  if (newVal) {
    updateVideoVolume();
    updatePlaybackSpeed();
  }
});

// Watch for other refs to be ready
watch([videoWithAudioRef, audioSyncRef, audioRef], () => {
  updatePlaybackSpeed();
});

// Update volume and playback speed on mount
onMounted(() => {
  updateVideoVolume();
  updatePlaybackSpeed();
});

// Guard against double-firing of ended event (Bug 1)
const endedEmitted = ref(false);
// Guard against emitting pause during stop() (Bug 4)
const isStopping = ref(false);
// Show pause icon during beat transitions (isStopping) to avoid play button flash
const showPauseButton = computed(() => shouldBePlaying.value || isStopping.value);
// AbortController for cancellable sleep in image-only beats (Bug 7)
let sleepAbortController: AbortController | null = null;

const cancelSleepTimer = () => {
  if (sleepAbortController) {
    sleepAbortController.abort();
    sleepAbortController = null;
  }
};

const handleVideoPlay = () => {
  shouldBePlaying.value = true;
  if (audioSyncRef.value && videoRef.value && !audioSyncRef.value.ended) {
    audioSyncRef.value.currentTime = videoRef.value.currentTime;
    void audioSyncRef.value.play().catch(() => {});
  }
  emit('play');
};
const handleVideoPause = (e: Event) => {
  // Don't emit pause during stop() - this keeps BGM playing during beat transitions
  if (isStopping.value) return;
  // Don't update shouldBePlaying if paused by browser in background
  if (!document.hidden) {
    shouldBePlaying.value = false;
  }
  // If the video is not at the end, it is determined to be a human operation.
  if (!videoRef.value?.ended && audioSyncRef?.value) {
    audioSyncRef.value?.pause();
  }
  handlePause(e);
};

const handleVideoEnd = () => {
  if (endedEmitted.value) return;
  const audioEnded = !audioSyncRef.value || audioSyncRef.value.ended;
  if (audioEnded) {
    handleEnded();
  }
};
const handleAudioEnd = () => {
  if (endedEmitted.value) return;
  const videoEnded = !videoRef.value || videoRef.value.ended;
  if (videoEnded) {
    handleEnded();
  }
};

const handlePlay = () => {
  shouldBePlaying.value = true;
  emit('play');
};

const handlePause = (e: Event) => {
  // Don't emit pause during stop() - this keeps BGM playing during beat transitions
  if (isStopping.value) return;
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
  if (endedEmitted.value) return;
  endedEmitted.value = true;
  shouldBePlaying.value = false;
  emit('ended');
};

const pauseMedia = () => {
  videoWithAudioRef.value?.pause();
  videoRef.value?.pause();
  audioRef.value?.pause();
};

// Track if media should be playing
const shouldBePlaying = ref(false);
let keepAliveInterval: ReturnType<typeof setInterval> | null = null;

const play = async () => {
  isStopping.value = false;
  endedEmitted.value = false;
  shouldBePlaying.value = true;
  if (videoWithAudioRef.value) {
    updatePlaybackSpeed();
    void videoWithAudioRef.value.play().catch(() => {});
  }
  if (videoRef.value) {
    updateVideoVolume();
    updatePlaybackSpeed();
    void videoRef.value.play().catch(() => {});
    if (audioSyncRef.value) {
      audioSyncRef.value.currentTime = videoRef.value.currentTime;
      void audioSyncRef.value.play().catch(() => {});
    }
  }
  if (audioRef.value) {
    updatePlaybackSpeed();
    void audioRef.value.play().catch(() => {});
  }
  if (!videoWithAudioRef.value && !videoRef.value && !audioRef.value) {
    try {
      sleepAbortController = new AbortController();
      await cancellableSleep((props.duration ?? 0) * 1000, sleepAbortController.signal);
      sleepAbortController = null;
      if (!endedEmitted.value) {
        shouldBePlaying.value = false;
        endedEmitted.value = true;
        emit('ended');
      }
    } catch {
      // Sleep was cancelled by stop()
    }
  }
};

const stop = () => {
  isStopping.value = true;
  shouldBePlaying.value = false;
  endedEmitted.value = true;
  cancelSleepTimer();
  videoWithAudioRef.value?.pause();
  videoRef.value?.pause();
  audioSyncRef.value?.pause();
  audioRef.value?.pause();
};

const handleVideoSeeked = () => {
  if (audioSyncRef.value && videoRef.value && !audioSyncRef.value.ended) {
    audioSyncRef.value.currentTime = videoRef.value.currentTime;
  }
};

// Helper to resume a media element if paused and not ended
const tryResumeMedia = (media: HTMLMediaElement | undefined) => {
  if (media?.paused && !media.ended) {
    void media.play().catch(() => {});
  }
};

// Helper to sync and resume audio with video
const syncAndResumeAudio = (video: HTMLVideoElement, audio: HTMLAudioElement) => {
  if (audio.paused && !audio.ended) {
    if (!video.ended) {
      audio.currentTime = video.currentTime;
    }
    void audio.play().catch(() => {});
  }
};

// Resume playback helper
const resumePlayback = () => {
  if (!shouldBePlaying.value) return;

  tryResumeMedia(videoWithAudioRef.value);

  // For video + audio sync case
  if (videoRef.value && audioSyncRef.value) {
    tryResumeMedia(videoRef.value);
    syncAndResumeAudio(videoRef.value, audioSyncRef.value);
  } else {
    tryResumeMedia(videoRef.value);
  }

  tryResumeMedia(audioRef.value);
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

  // Cancel pending sleep timer
  cancelSleepTimer();
});

defineExpose({
  play,
  stop,
});
</script>
