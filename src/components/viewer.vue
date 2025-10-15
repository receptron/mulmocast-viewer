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
          <Page :data="dataSet[current]" :basePath="basePath" :index="current" />
          <Page
            :data="dataSet[current + 1]"
            :basePath="basePath"
            :index="current + 1"
            v-if="current + 1 < countOfPages"
            v-show="false"
          />
        </div>

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

interface Props {
  dataSet: unknown[];
  basePath: string;
}
const props = defineProps<Props>();

const countOfPages = props.dataSet.length;
const current = ref(0);

const pageMove = (a: number) => {
  const nextPage = current.value + a;
  if (nextPage > -1 && nextPage < countOfPages) {
    current.value = nextPage;
  }
};
</script>
