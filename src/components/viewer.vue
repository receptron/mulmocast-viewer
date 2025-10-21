<template>
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
          <Page
            ref="mediaPlayer"
            :video-with-audio-source="videoWithAudioSource"
            :video-source="videoSource"
            :sound-effect-source="soundEffectSource"
            :audio-source="audioSource"
            :image-source="imageSource"
            :index="currentPage"
            :text="text"
            :duration="currentPageData?.duration"
            @play="handlePlay"
            @pause="handlePause"
            @ended="handleEnded"
          />
          <Page
            v-if="currentPage + 1 < countOfPages"
            v-show="false"
            :data="dataSet?.beats[currentPage + 1]"
            :base-path="basePath"
            :index="currentPage + 1"
          />
        </div>
        <audio v-if="dataSet?.bgmFile" ref="bgmRef" :src="dataSet?.bgmFile" />

        <button
          class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
          :disabled="currentPage >= countOfPages - 1"
          @click="pageMove(1)"
        >
          Next
        </button>
      </div>
    </div>
    <div>Audio: <SelectLanguage v-model="audioLang" /></div>
    <div>Text: <SelectLanguage v-model="textLang" /></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

import { type ViewerData } from '../lib/type';
import { sleep } from './utils';

import Page from './page.vue';
import SelectLanguage from './select_language.vue';

interface Props {
  dataSet?: ViewerData;
  basePath: string;
  initPage?: number;
}
const props = defineProps<Props>();

const emit = defineEmits<{
  updatedPage: [nextPage: number];
}>();

const countOfPages = props.dataSet?.beats?.length ?? 0;

const currentPage = ref(props.initPage ?? 0);
const autoPlay = ref(true);

const mediaPlayer = ref<{ play: () => Promise<void> }>();
const bgmRef = ref<HTMLAudioElement>();

const textLang = ref('en');
const audioLang = ref('ja');

const currentPageData = computed(() => {
  const data = props.dataSet?.beats[currentPage.value];
  return data;
});
const videoWithAudioSource = computed(() => {
  return currentPageData.value?.videoWithAudioSource
    ? props.basePath + '/' + currentPageData.value.videoWithAudioSource
    : '';
});
const soundEffectSource = computed(() => {
  return currentPageData.value?.soundEffectSource
    ? props.basePath + '/' + currentPageData.value.soundEffectSource
    : '';
});
const videoSource = computed(() => {
  return currentPageData.value?.videoSource
    ? props.basePath + '/' + currentPageData.value.videoSource
    : '';
});
const audioSource = computed(() => {
  const audioFile = currentPageData.value?.audioSources?.[audioLang.value];
  return audioFile ? props.basePath + '/' + audioFile : '';
});
const imageSource = computed(() => {
  return currentPageData.value?.imageSource
    ? props.basePath + '/' + currentPageData.value.imageSource
    : '';
});

const text = computed(() => {
  return (
    currentPageData.value?.multiLinguals?.[textLang.value] ?? currentPageData.value?.text ?? ''
  );
});
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

defineExpose({
  updatePage,
});
</script>
