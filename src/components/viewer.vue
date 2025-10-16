<template>
  <div class="w-full overflow-hidden">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between">
        <button
          class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
          :disabled="current === 0"
          @click="pageMove(-1)"
        >
          Prev
        </button>

        <div class="px-4">
          <Page
            ref="mediaPlayer"
            :video-with-audio-source="videoWithAudioSource"
            :video-source="videoSource"
            :audio-source="audioSource"
            :image-source="imageSource"
            :index="current"
            :text="text"
            :duration="currentPageData?.duration"
            @play="handlePlay"
            @pause="handlePause"
            @ended="handleEnded"
          />
          <Page
            v-if="current + 1 < countOfPages"
            v-show="false"
            :data="dataSet.beats[current + 1]"
            :base-path="basePath"
            :index="current + 1"
          />
        </div>
        <audio v-if="dataSet.bgmFile" ref="bgmRef" :src="dataSet.bgmFile" />

        <button
          class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
          :disabled="current >= countOfPages - 1"
          @click="pageMove(1)"
        >
          Next
        </button>
      </div>
    </div>
    <div>Audio: <SelectLanguage v-model="audioLang" /></div>
    <div>Text: <SelectLanguage v-model="textLang" /></div>
    {{ captionLang }}
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Page from './page.vue';
import { type BundleItem } from './type';
import { sleep } from './utils';
import SelectLanguage from './select_language.vue';

interface Props {
  dataSet: {
    beats: BundleItem[];
    bgmSource?: string;
    bgmFile?: string;
  };
  basePath: string;
}
const props = defineProps<Props>();

const countOfPages = props.dataSet.beats.length;
const current = ref(0);
const autoPlay = ref(true);

const mediaPlayer = ref<{ play: () => Promise<void> }>();
const bgmRef = ref<HTMLAudioElement>();

const captionLang = ref('en');
const textLang = ref('en');
const audioLang = ref('ja');

const currentPageData = computed(() => {
  return props.dataSet.beats[current.value];
});
const videoWithAudioSource = computed(() => {
  return currentPageData.value?.videoWithAudioSource
    ? props.basePath + '/' + currentPageData.value.videoWithAudioSource
    : '';
});
const videoSource = computed(() => {
  return currentPageData.value?.videoSource
    ? props.basePath + '/' + currentPageData.value.videoSource
    : '';
});
const audioSource = computed(() => {
  return currentPageData.value?.audioSources?.[audioLang.value]
    ? props.basePath + '/' + currentPageData.value.audioSources[audioLang.value]
    : '';
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

const pageMove = (a: number) => {
  const nextPage = current.value + a;
  if (nextPage > -1 && nextPage < countOfPages) {
    current.value = nextPage;
    if (isPlaying.value && autoPlay.value) {
      void waitAndPlay();
    }
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
</script>
