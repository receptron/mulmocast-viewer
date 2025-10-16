<template>
  <div>
    <Viewers :data-set="data" :base-path="basePath" v-if="data" />
    <div v-if="data === null">404</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

import Viewers from '../components/viewer.vue';
import { sampleData } from './data';
import { type ViewerData } from '../lib/type';

const data = ref<ViewerData | null | undefined>(undefined);

const route = useRoute();
const { contentsId } = route.params;

const basePath = computed(() => {
  return '/' + contentsId;
});

const main = async () => {
  try {
    const res = await fetch('/' + contentsId + '/mulmo_view.json');
    if (res.status === 200) {
      data.value = (await res.json()) as ViewerData;
    } else {
      data.value = null;
    }
  } catch {
    data.value = null;
  }
};

main();
</script>
