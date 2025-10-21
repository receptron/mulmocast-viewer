<template>
  <slot v-bind="slotProps">
    <!-- Default UI -->
    <div class="w-full overflow-hidden">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex items-center justify-between">
          <button
            class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
            :disabled="currentPage === 0"
            @click="pageMove(-1)"
          >
            Prev
          </button>

          <div class="px-4">
            <MulmoPlayer ref="mediaPlayer" v-bind="pageProps" />
          </div>

          <button
            class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
            :disabled="currentPage >= countOfPages - 1"
            @click="pageMove(1)"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </slot>

  <!-- Hidden preload and bgm -->
  <MulmoPlayer v-if="nextPageProps" v-show="false" v-bind="nextPageProps" />
  <audio v-if="dataSet?.bgmFile" ref="bgmRef" :src="dataSet?.bgmFile" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

import { type ViewerData } from '../lib/type';
import { sleep } from './utils';

import MulmoPlayer from './mulmo_player.vue';
import SelectLanguage from './select_language.vue';

interface Props {
  dataSet?: ViewerData;
  basePath: string;
  initPage?: number;
  audioLang?: string;
  textLang?: string;
}
const props = withDefaults(defineProps<Props>(), {
  audioLang: 'en',
  textLang: 'en',
});

const emit = defineEmits<{
  updatedPage: [nextPage: number];
  'update:audioLang': [lang: string];
  'update:textLang': [lang: string];
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

const currentPageData = computed(() => props.dataSet?.beats[currentPage.value]);

// Helper function to build media source path
const getMediaPath = (source: string | undefined) => {
  return source ? props.basePath + '/' + source : '';
};

const isPlaying = ref(false);

const handlePlay = () => {
  isPlaying.value = true;
  if (bgmRef.value) {
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
  isPlaying.value = false;
  if (autoPlay.value && pageMove(1)) {
    void waitAndPlay();
  } else if (bgmRef.value) {
    bgmRef.value.pause();
  }
};

// Current page props
const pageProps = computed(() => {
  const data = currentPageData.value;
  const audioFile = data?.audioSources?.[audioLang.value];
  return {
    videoWithAudioSource: getMediaPath(data?.videoWithAudioSource),
    videoSource: getMediaPath(data?.videoSource),
    soundEffectSource: getMediaPath(data?.soundEffectSource),
    audioSource: audioFile ? props.basePath + '/' + audioFile : '',
    imageSource: getMediaPath(data?.imageSource),
    index: currentPage.value,
    text: data?.multiLinguals?.[textLang.value] ?? data?.text ?? '',
    duration: data?.duration,
    onPlay: handlePlay,
    onPause: handlePause,
    onEnded: handleEnded,
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
    audioSource: nextData?.audioSources?.[audioLang.value]
      ? props.basePath + '/' + nextData.audioSources[audioLang.value]
      : '',
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
}));

defineExpose({
  updatePage,
});
</script>
