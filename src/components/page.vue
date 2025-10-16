<template>
  <div class="items-center justify-center w-full">
    <div v-if="videoWithAudioSource">
      <video
        :src="videoWithAudioSource"
        class="mx-auto h-auto max-h-[80vh] w-auto object-contain"
        :controls="controlsEnabled"
        @play="handlePlay"
        @pause="handlePause"
        @ended="handleEnded"
        ref="videoWithAudioRef"
      />
    </div>
    <div v-else-if="videoSource" class="relative inline-block">
      <video
        class="mx-auto h-auto max-h-[80vh] w-auto object-contain"
        :src="videoSource"
        ref="videoRef"
        :controls="controlsEnabled"
        @play="handleVideoPlay"
        @pause="handleVideoPause"
        @ended="handleVideoEnd"
      />
      <audio
        :src="audioSource"
        ref="audioSyncRef"
        v-if="audioSource"
        @ended="handleAudioEnd"
        :controls="true"
      />
    </div>
    <div v-else-if="audioSource">
      <video
        class="mx-auto h-auto max-h-[80vh] w-auto object-contain"
        :src="audioSource"
        :poster="imageSource ?? mulmoImage"
        :controls="controlsEnabled"
        @play="handlePlay"
        @pause="handlePause"
        @ended="handleEnded"
        ref="audioRef"
      />
    </div>
    <div v-else-if="imageSource" class="relative inline-block">
      <img :src="imageSource" class="max-w-full max-h-full object-contain" ref="imageRef" />
    </div>
    <div v-else>{{ t('ui.common.noMedia') }}</div>
    {{ text }}
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { sleep } from './utils';

const { t } = useI18n();
interface Props {
  index: number;
  videoWithAudioSource?: string;
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

const videoWithAudioRef = ref();
const videoRef = ref();
const audioSyncRef = ref();
const audioRef = ref();
const imageRef = ref();

const handleVideoPlay = () => {
  if (audioSyncRef.value) {
    audioSyncRef.value.currentTime = videoRef.value.currentTime;
    if (audioSyncRef.value.currentTime === videoRef.value.currentTime) {
      audioSyncRef.value.play();
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
    audioSyncRef.value?.currentTime > 0;
  if (!audioPlaying) {
    handleEnded();
  }
};
const handleAudioEnd = () => {
  const audioPlaying =
    !videoRef.value?.paused && !videoRef.value?.ended && videoRef.value?.currentTime > 0;
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
const controlsEnabled = computed(() => {
  return !!props.audioSource;
});

const play = async () => {
  if (videoWithAudioRef.value) {
    videoWithAudioRef.value.play();
  }
  if (videoRef.value) {
    videoRef.value.play();
  }
  if (audioRef.value) {
    audioRef.value.play();
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
