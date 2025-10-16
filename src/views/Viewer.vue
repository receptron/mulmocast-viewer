<template>
  <div>
    <Viewers v-if="data" :data-set="data" :base-path="basePath" />
    <div v-if="data === null">404</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

import Viewers from '../components/viewer.vue';
import { type ViewerData } from '../lib/type';

const data = ref<ViewerData | null | undefined>(undefined);

const route = useRoute();
const contentsIdParam = route.params.contentsId;
const contentsId = Array.isArray(contentsIdParam) ? contentsIdParam[0] : contentsIdParam;

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

void main();
</script>
