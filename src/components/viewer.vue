<template>
  <div>
    viewer
    <button @click="pageMove(-1)">left</button>

    <Page :data="dataSet[current]" :basePath="basePath" :index="current" />
    <Page :data="dataSet[current + 1]" :basePath="basePath" :index="current + 1" v-if="current + 1 < countOfPages" v-show="false" />
    
    <button @click="pageMove(1)">right</button>
    {{ current }}
    {{ countOfPages }}
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
