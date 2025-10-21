<template>
  <div>
    <Viewers
      v-if="data"
      ref="viewerRef"
      :data-set="data"
      :base-path="basePath"
      :init-page="routerPage"
      v-model:audio-lang="audioLang"
      v-model:text-lang="textLang"
      @updated-page="updateRouter"
    />
    <div v-if="data">
      <div>Audio: <SelectLanguage v-model="audioLang" /></div>
      <div>Text: <SelectLanguage v-model="textLang" /></div>
    </div>
    <div v-if="data === null">404</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import Viewers from '../components/mulmo_viewer.vue';
import SelectLanguage from '../components/select_language.vue';
import { type ViewerData } from '../lib/type';

const viewerRef = ref<HTMLElement | null>(null);

const data = ref<ViewerData | null | undefined>(undefined);
const audioLang = ref('en');
const textLang = ref('en');

const route = useRoute();
const router = useRouter();

const routerPage = computed(() => Number(route.params.page ?? 0));

const updateRouter = (nextPage: number) => {
  void router.push({
    name: route.name,
    params: { ...route.params, page: nextPage.toString() },
  });
};

/*
watch(routerPage, (value) => {
  viewerRef.value.updatePage(value);
});
*/

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
