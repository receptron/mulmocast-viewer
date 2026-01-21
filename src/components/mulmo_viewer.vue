<template>
  <slot v-bind="slotProps">
    <!-- Default UI -->
    <div class="w-full overflow-hidden">
      <div class="max-w-7xl mx-auto px-4">
        <!-- Buttons are vertically centered with slide image only -->
        <div class="grid grid-cols-[auto,1fr,auto] gap-x-4 gap-y-4 max-sm:grid-cols-2">
          <button
            class="col-start-1 row-start-1 justify-self-start w-auto px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 self-center max-sm:row-start-2"
            :disabled="currentPage === 0"
            @click="pageMove(-1)"
          >
            Prev
          </button>

          <div class="col-start-2 row-start-1 min-w-0 max-sm:col-span-2 max-sm:col-start-1">
            <MulmoPlayer ref="mediaPlayer" v-bind="{ ...pageProps, text: '', originalText: '' }" />
          </div>

          <button
            class="col-start-3 row-start-1 justify-self-end w-auto px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 self-center max-sm:col-start-2 max-sm:row-start-2"
            :disabled="currentPage >= countOfPages - 1"
            @click="pageMove(1)"
          >
            Next
          </button>

          <!-- Text row: aligned with slide width -->
          <div
            v-if="pageProps.text"
            class="mulmo-text-box col-start-2 row-start-2 min-w-0 mt-1 rounded-lg px-6 py-4 text-left max-sm:col-span-2 max-sm:col-start-1 max-sm:row-start-3"
          >
            <p class="mulmo-text-primary text-lg leading-relaxed font-sans">{{ pageProps.text }}</p>
            <p
              v-if="pageProps.originalText && pageProps.originalText !== pageProps.text"
              class="mulmo-text-secondary text-base leading-relaxed font-sans mt-3 italic"
            >
              {{ pageProps.originalText }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </slot>

  <!-- Hidden preload and bgm -->
  <MulmoPlayer v-if="nextPageProps" v-show="false" v-bind="nextPageProps" />
  <audio v-if="bgmPath" ref="bgmRef" :src="bgmPath" />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

import { type ViewerData } from '../lib/type';
import { sleep } from './utils';

import MulmoPlayer from './mulmo_player.vue';
import SelectLanguage from './select_language.vue';

interface MulmoViewerProps {
  dataSet?: ViewerData;
  basePath: string;
  initPage?: number;
  audioLang?: string;
  textLang?: string;
  playbackSpeed?: number;
}
const props = withDefaults(defineProps<MulmoViewerProps>(), {
  audioLang: 'en',
  textLang: 'en',
  playbackSpeed: 1,
});

const emit = defineEmits<{
  updatedPage: [nextPage: number];
  'update:audioLang': [lang: string];
  'update:textLang': [lang: string];
  allCompleted: [];
}>();

const countOfPages = props.dataSet?.beats?.length ?? 0;

const currentPage = ref(props.initPage ?? 0);
const autoPlay = ref(true);

const mediaPlayer = ref<{ play: () => Promise<void> }>();
const bgmRef = ref<HTMLAudioElement>();

const audioLang = computed({
  get: () => props.audioLang,
  set: (value) => emit('update:audioLang', value || 'en'),
});

const textLang = computed({
  get: () => props.textLang,
  set: (value) => emit('update:textLang', value || 'en'),
});

// Watch for audio language changes and restart playback if playing
watch(
  () => props.audioLang,
  async (newVal, oldVal) => {
    // Only restart if language actually changed and was playing
    if (newVal !== oldVal && isPlaying.value) {
      // Temporarily mark as not playing to stop background playback
      const wasPlaying = isPlaying.value;
      isPlaying.value = false;

      // Wait for the component to update with new audio source
      await sleep(500);

      // Restart playback
      if (wasPlaying && mediaPlayer.value) {
        isPlaying.value = true;
        await mediaPlayer.value.play();
      }
    }
  }
);

// Watch for text language changes and restart playback if playing
watch(
  () => props.textLang,
  async (newVal, oldVal) => {
    // Only restart if language actually changed and was playing
    if (newVal !== oldVal && isPlaying.value) {
      // Wait for the component to update with new text
      await sleep(100);

      // Restart playback
      if (mediaPlayer.value) {
        await mediaPlayer.value.play();
      }
    }
  }
);

// Set BGM volume when bgmRef is available
watch(bgmRef, (newRef) => {
  if (newRef) {
    newRef.volume = 0.3;
  }
});

const currentPageData = computed(() => props.dataSet?.beats[currentPage.value]);

// Helper function to build media source path
const getMediaPath = (source: string | undefined) => {
  return source ? props.basePath + '/' + source : '';
};

const bgmPath = computed(() => getMediaPath(props.dataSet?.bgmSource));

const isPlaying = ref(false);

const handlePlay = () => {
  isPlaying.value = true;
  if (bgmRef.value) {
    bgmRef.value.volume = 0.3;
    void bgmRef.value.play();
  }
};

const handlePause = () => {
  console.log('pause');
  isPlaying.value = false;
  if (bgmRef.value) {
    bgmRef.value.pause();
  }
};

const waitAndPlay = async () => {
  await sleep(500);
  if (mediaPlayer.value) {
    void mediaPlayer.value.play();
  }
};

const updatePage = (value: number) => {
  if (currentPage.value !== value) {
    currentPage.value = value;
    if (isPlaying.value && autoPlay.value) {
      void waitAndPlay();
    }
  }
};

const pageMove = (delta: number) => {
  const nextPage = currentPage.value + delta;
  if (nextPage > -1 && nextPage < countOfPages) {
    updatePage(nextPage);
    emit('updatedPage', nextPage);
    return true;
  }
  return false;
};

const handleEnded = () => {
  console.log('end');
  if (autoPlay.value && pageMove(1)) {
    void waitAndPlay();
  } else {
    isPlaying.value = false;
    if (bgmRef.value) {
      bgmRef.value.pause();
    }
    emit('allCompleted');
  }
};

// Event handlers
const eventHandlers = {
  onPlay: handlePlay,
  onPause: handlePause,
  onEnded: handleEnded,
};

// Current page props
const pageProps = computed(() => {
  const data = currentPageData.value;
  const audioFile = data?.audioSources?.[audioLang.value];
  const currentText = data?.multiLinguals?.[textLang.value] ?? data?.text ?? '';
  const originalText = props.dataSet?.lang ? (data?.multiLinguals?.[props.dataSet.lang] ?? data?.text ?? '') : '';

  return {
    videoWithAudioSource: getMediaPath(data?.videoWithAudioSource),
    videoSource: getMediaPath(data?.videoSource),
    soundEffectSource: getMediaPath(data?.soundEffectSource),
    audioSource: getMediaPath(audioFile),
    imageSource: getMediaPath(data?.imageSource),
    index: currentPage.value,
    text: currentText,
    originalText: originalText,
    duration: data?.duration,
    defaultLang: props.dataSet?.lang,
    currentLang: audioLang.value,
    playbackSpeed: props.playbackSpeed,
    ...eventHandlers,
  };
});

// Next page props for preloading
const nextPageData = computed(() => props.dataSet?.beats[currentPage.value + 1]);
const nextPageProps = computed(() => {
  if (currentPage.value + 1 >= countOfPages) return null;
  const nextData = nextPageData.value;
  return {
    videoWithAudioSource: getMediaPath(nextData?.videoWithAudioSource),
    videoSource: getMediaPath(nextData?.videoSource),
    soundEffectSource: getMediaPath(nextData?.soundEffectSource),
    audioSource: getMediaPath(nextData?.audioSources?.[audioLang.value]),
    imageSource: getMediaPath(nextData?.imageSource),
    index: currentPage.value + 1,
    text: nextData?.multiLinguals?.[textLang.value] ?? nextData?.text ?? '',
    duration: nextData?.duration,
  };
});

// Slot props
const slotProps = computed(() => ({
  MulmoPlayer,
  pageProps: pageProps.value,
  currentPage: currentPage.value,
  pageCount: countOfPages,
  pageMove,
  isPlaying: isPlaying.value,
  audioLang,
  textLang,
  SelectLanguage,
  mediaPlayerRef: mediaPlayer,
  // Event handlers for direct access
  handlePlay,
  handlePause,
  handleEnded,
}));

defineExpose({
  updatePage,
});
</script>

<style scoped>
.mulmo-text-box {
  background: var(--mulmo-text-bg, #ffffff);
  color: inherit;
}

.mulmo-text-primary {
  color: var(--mulmo-text-primary, inherit);
}

.mulmo-text-secondary {
  color: inherit;
  opacity: var(--mulmo-text-secondary-opacity, 0.7);
}
</style>
