<template>
  <div class="w-full overflow-hidden">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between">
        <button
          @click="pageMove(-1)"
          class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
          :disabled="current === 0"
        >
          Prev
        </button>

        <div class="px-4">
          <Page
            :data="dataSet.beats[current]"
            :basePath="basePath"
            :index="current"
            @play="handlePlay"
            @pause="handlePause"
            @ended="handleEnded"
            ref="mediaPlayer"
          />
          <Page
            :data="dataSet.beats[current + 1]"
            :basePath="basePath"
            :index="current + 1"
            v-if="current + 1 < countOfPages"
            v-show="false"
          />
        </div>
        <audio :src="dataSet.bgmFile" ref="bgmRef" v-if="dataSet.bgmFile" />

        <button
          @click="pageMove(1)"
          class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
          :disabled="current >= countOfPages - 1"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Page from './page.vue';
import { type BundleItem } from './type';

const sleep = async (milliseconds: number) => {
  return await new Promise((resolve) => setTimeout(resolve, milliseconds));
};

interface Props {
  dataSet: {
    beats: BundleItem[];
    bgmSource: string;
  };
  basePath: string;
}
const props = defineProps<Props>();

const countOfPages = props.dataSet.beats.length;
const current = ref(0);
const autoPlay = ref(true);

const mediaPlayer = ref();
const bgmRef = ref();

const isPlaying = ref(false);

const handlePlay = () => {
  isPlaying.value = true;
  if (bgmRef.value) {
    bgmRef.value.play();
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
    mediaPlayer.value.play();
  }
  if (audioRef.value) {
    audioRef.value.play();
  }
};

const pageMove = (a: number) => {
  const nextPage = current.value + a;
  if (nextPage > -1 && nextPage < countOfPages) {
    current.value = nextPage;
    if (isPlaying.value && autoPlay.value) {
      waitAndPlay();
    }
    return true;
  }
  return false;
};

const handleEnded = async () => {
  console.log('end');
  isPlaying.value = false;
  if (autoPlay.value && pageMove(1)) {
    waitAndPlay();
  } else if (bgmRef.value) {
    bgmRef.value.pause();
  }
};
</script>
