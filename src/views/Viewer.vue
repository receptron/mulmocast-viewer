<template>
  <div>
    <!-- Default UI Sample -->
    <div v-if="!useCustomUI">
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
      <div v-if="data">
        <div>Audio: <SelectLanguage v-model="audioLang" /></div>
        <div>Text: <SelectLanguage v-model="textLang" /></div>
      </div>
    </div>

    <!-- Custom UI Sample -->
    <div v-else>
      <MulmoViewer
        v-if="data"
        ref="viewerRef"
        :data-set="data"
        :base-path="basePath"
        :init-page="routerPage"
        v-model:audio-lang="audioLang"
        v-model:text-lang="textLang"
        @updated-page="updateRouter"
        v-slot="{ MulmoPlayer, pageProps, pageMove, currentPage, pageCount, mediaPlayerRef }"
      >
        <div class="flex flex-col gap-4 max-w-screen-xl mx-auto p-4">
          <div class="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
            <button
              class="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              @click="pageMove(-1)"
              :disabled="currentPage === 0"
            >
              ← Previous
            </button>
            <div class="text-xl font-bold text-gray-800">
              {{ currentPage + 1 }} / {{ pageCount }}
            </div>
            <button
              class="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              @click="pageMove(1)"
              :disabled="currentPage >= pageCount - 1"
            >
              Next →
            </button>
          </div>

          <div class="bg-black rounded-lg overflow-hidden">
            <component :is="MulmoPlayer" :ref="mediaPlayerRef" v-bind="pageProps" />
          </div>
        </div>
      </MulmoViewer>
      <div v-if="data" class="mt-4 p-4 bg-gray-100 rounded-lg flex gap-8 justify-center">
        <div>Audio: <SelectLanguage v-model="audioLang" /></div>
        <div>Text: <SelectLanguage v-model="textLang" /></div>
      </div>
    </div>

    <div v-if="data === null">404</div>

    <!-- Toggle button for demo -->
    <button
      v-if="data"
      @click="useCustomUI = !useCustomUI"
      class="fixed bottom-8 right-8 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-lg transition-colors z-50"
    >
      Switch to {{ useCustomUI ? 'Default' : 'Custom' }} UI
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import MulmoViewer from '../components/mulmo_viewer.vue';
import SelectLanguage from '../components/select_language.vue';
import { type ViewerData } from '../lib/type';

type MulmoViewerInstance = InstanceType<typeof MulmoViewer>;
const viewerRef = ref<MulmoViewerInstance | null>(null);

const data = ref<ViewerData | null | undefined>(undefined);
const audioLang = ref('en');
const textLang = ref('en');
const useCustomUI = ref(false);

const route = useRoute();
const router = useRouter();

const routerPage = computed(() => Number(route.params.page ?? 0));

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
