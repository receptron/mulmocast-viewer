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
        muted
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
    <div>
      {{ text }}
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

const handleVideoPlay = () => {
  if (audioSyncRef.value && videoRef.value) {
    audioSyncRef.value.currentTime = videoRef.value.currentTime;
    if (audioSyncRef.value.currentTime === videoRef.value.currentTime) {
      void audioSyncRef.value.play();
    }
  }
  emit('play');
};
const handleVideoPause = (e: Event) => {
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
  emit('play');
};

const handlePause = (e: Event) => {
  const video = e.target as HTMLVideoElement;
  // It also fires on the end event, so pause is not sent in that case.
  if (video.duration !== video.currentTime) {
    emit('pause');
  }
};
const handleEnded = () => {
  emit('ended');
};
/*
const videoControlsEnabled = computed(() => {
  console.log(props.audioSource);
  return !props.audioSource;
});
*/
const audio = computed(() => props.audioSource);
watch(audio, () => {
  sleep(300).then(() => {
    console.log(audioRef);
    if (audioRef.value) {
      void audioRef.value.play();
    }
  });
  console.log("AA");
});
const play = async () => {
  if (videoWithAudioRef.value) {
    void videoWithAudioRef.value.play();
  }
  if (videoRef.value) {
    void videoRef.value.play();
  }
  if (audioRef.value) {
    void audioRef.value.play();
  }
  if (!videoWithAudioRef.value && !videoRef.value && !audioRef.value) {
    await sleep((props.duration ?? 0) * 1000);
    emit('ended');
  }
};

// Handle background tab - prevent pause when tab becomes hidden
const handleVisibilityChange = () => {
  if (document.hidden) {
    // Tab is now hidden - ensure media continues playing
    const isVideoWithAudioPlaying = videoWithAudioRef.value && !videoWithAudioRef.value.paused;
    const isVideoPlaying = videoRef.value && !videoRef.value.paused;
    const isAudioPlaying = (audioRef.value && !audioRef.value.paused) || (audioSyncRef.value && !audioSyncRef.value.paused);

    if (isVideoWithAudioPlaying || isVideoPlaying || isAudioPlaying) {
      // Force resume playback after a brief delay
      setTimeout(() => {
        if (videoWithAudioRef.value && videoWithAudioRef.value.paused) {
          void videoWithAudioRef.value.play();
        }
        if (videoRef.value && videoRef.value.paused) {
          void videoRef.value.play();
        }
        if (audioRef.value && audioRef.value.paused) {
          void audioRef.value.play();
        }
        if (audioSyncRef.value && audioSyncRef.value.paused) {
          void audioSyncRef.value.play();
        }
      }, 100);
    }
  }
};

onMounted(() => {
  document.addEventListener('visibilitychange', handleVisibilityChange);
});

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});

defineExpose({
  play,
});
</script>
