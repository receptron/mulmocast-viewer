<template>
  <div>
    <!-- Beat Info Header -->
    <div v-if="data" class="bg-white border-b border-gray-200 shadow-sm">
      <div class="container mx-auto px-4 py-4">
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <!-- Left: Beat Number and Time Info -->
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

          <!-- Right: Language Controls and View List Button -->
          <div class="flex items-center gap-4 flex-wrap">
            <router-link
              :to="`/contents/${contentsId}/list?beat=${routerPage}&textLang=${textLang}`"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors"
            >
              View List
            </router-link>
            <div class="flex items-center gap-3">
              <label class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Speed:</label>
              <select
                v-model.number="playbackSpeed"
                class="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option :value="1">1x</option>
                <option :value="1.25">1.25x</option>
                <option :value="1.5">1.5x</option>
                <option :value="1.75">1.75x</option>
                <option :value="2">2x</option>
              </select>
            </div>
            <div class="flex items-center gap-3">
              <label class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Audio:</label>
              <SelectLanguage v-model="audioLang" />
            </div>
            <div class="flex items-center gap-3">
              <label class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Text:</label>
              <SelectLanguage v-model="textLang" />
            </div>
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
      :playback-speed="playbackSpeed"
      @updated-page="updateRouter"
    />

    <div v-if="data === null" class="text-center py-12">
      <p class="text-red-600 text-xl">404 - Content not found</p>
    </div>
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
const playbackSpeed = ref(1);

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
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
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

// Auto-play when coming from list view
const shouldAutoplay = ref(route.query.autoplay === 'true');

watch([data, viewerRef], ([newData, newViewerRef]) => {
  if (shouldAutoplay.value && newData && newViewerRef) {
    // Wait a bit for everything to be ready
    setTimeout(() => {
      // Try to trigger play through the exposed slot props
      const mediaPlayerRef = document.querySelector('.mulmocast-video, .mulmocast-audio');
      if (mediaPlayerRef) {
        const playButton = document.querySelector('video, audio');
        if (playButton) {
          (playButton as HTMLMediaElement).play().catch(() => {
            // Autoplay might be blocked by browser
            console.log('Autoplay was prevented by browser');
          });
        }
      }
      shouldAutoplay.value = false; // Only autoplay once
    }, 800);
  }
}, { immediate: true });

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
