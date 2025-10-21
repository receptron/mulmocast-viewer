<template>
  <div class="items-center justify-center w-full">
    <div v-if="videoWithAudioSource">
      <video
        ref="videoWithAudioRef"
        :src="videoWithAudioSource"
        class="mx-auto h-auto max-h-[80vh] w-auto object-contain"
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
        class="mx-auto h-auto max-h-[80vh] w-auto object-contain"
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
    <div v-else-if="audioSource">
      <video
        ref="audioRef"
        class="mx-auto h-auto max-h-[80vh] w-auto object-contain"
        :src="audioSource"
        :poster="imageSource ?? mulmoImage"
        :controls="true"
        playsinline="true"
        @play="handlePlay"
        @pause="handlePause"
        @ended="handleEnded"
      />
    </div>
    <div v-else-if="imageSource" class="relative inline-block">
      <img ref="imageRef" :src="imageSource" class="max-w-full max-h-full object-contain" />
    </div>
    <div v-else>{{ t('ui.common.noMedia') }}</div>
    {{ text }}
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { sleep } from './utils';

const { t } = useI18n();
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
const audioRef = ref<HTMLVideoElement>();
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
defineExpose({
  play,
});
</script>

<style>
video::-webkit-media-controls-enclosure {
  background-color: rgba(0, 0, 0, 0.5) !important;
  border-radius: 0 !important;
}

video::-webkit-media-controls-current-time-display,
video::-webkit-media-controls-time-remaining-display {
  -webkit-text-fill-color: #fff !important;
}

video::-webkit-media-controls-play-button,
video::-webkit-media-controls-mute-button,
video::-webkit-media-controls-overlay-play-button,
video::-webkit-media-controls-fullscreen-button {
  filter: brightness(1.1);
}

video::-webkit-media-controls {
  opacity: 0;
  transition: opacity 0.3s ease;
}
video:hover::-webkit-media-controls {
  opacity: 1;
}
</style>
