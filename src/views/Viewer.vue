<template>
  <div>
    <!-- Beat Info Header -->
    <div v-if="data" class="bg-white border-b border-gray-200 shadow-sm">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center gap-4 flex-wrap">
          <div class="bg-indigo-600 text-white px-4 py-2 rounded-full text-lg font-bold">
            #{{ routerPage + 1 }}
          </div>
          <div class="flex items-center gap-4 text-gray-600 text-sm">
            <span v-if="currentBeat?.startTime !== undefined">
              <span class="font-semibold">Start:</span> {{ formatDuration(currentBeat.startTime) }}
            </span>
            <span v-if="currentBeat?.duration">
              <span class="font-semibold">Duration:</span> {{ formatDuration(currentBeat.duration) }}
            </span>
            <span v-if="currentBeat?.endTime !== undefined">
              <span class="font-semibold">End:</span> {{ formatDuration(currentBeat.endTime) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <MulmoViewer
      v-if="data"
      ref="viewerRef"
      :data-set="data"
      :base-path="basePath"
      :init-page="routerPage"
      v-model:audio-lang="audioLang"
      v-model:text-lang="textLang"
      @updated-page="updateRouter"
    />
    <div v-if="data" class="mt-6 flex flex-col sm:flex-row gap-6 justify-center items-center bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl shadow-sm">
      <router-link
        :to="`/contents/${contentsId}/list?beat=${routerPage}&textLang=${textLang}`"
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors"
      >
        View List
      </router-link>
      <div class="flex items-center gap-3">
        <label class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Audio:</label>
        <SelectLanguage v-model="audioLang" />
      </div>
      <div class="flex items-center gap-3">
        <label class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Text:</label>
        <SelectLanguage v-model="textLang" />
      </div>
    </div>

    <div v-if="data === null">404</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import MulmoViewer from '../components/mulmo_viewer.vue';
import SelectLanguage from '../components/select_language.vue';
import { type ViewerData } from '../lib/type';

const route = useRoute();
const router = useRouter();

type MulmoViewerInstance = InstanceType<typeof MulmoViewer>;
const viewerRef = ref<MulmoViewerInstance | null>(null);

const data = ref<ViewerData | null | undefined>(undefined);
// Initialize language from URL parameter or default to 'en'
const audioLang = ref((route.query.audioLang as string) || 'en');
const textLang = ref((route.query.textLang as string) || 'en');

// Update URL when languages change
watch([audioLang, textLang], ([newAudioLang, newTextLang]) => {
  const query = { ...route.query, audioLang: newAudioLang, textLang: newTextLang };
  router.replace({ query });
});

const routerPage = computed(() => Number(route.params.page ?? 0));

const currentBeat = computed(() => {
  if (!data.value) return null;
  return data.value.beats[routerPage.value];
});

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const updateRouter = (nextPage: number) => {
  void router.push({
    name: route.name,
    params: { ...route.params, page: nextPage.toString() },
  });
};

watch(routerPage, (value) => {
  if (viewerRef.value?.updatePage) {
    viewerRef.value.updatePage(value);
  }
});

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
