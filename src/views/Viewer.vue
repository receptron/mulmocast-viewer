<template>
  <div>
    <!-- Beat Info Header -->
    <MulmoViewerHeader
      v-if="data"
      v-model:audio-lang="audioLang"
      v-model:text-lang="textLang"
      v-model:playback-speed="playbackSpeed"
      v-model:show-mobile-settings="showMobileSettings"
    >
      <template #left>
        <div class="bg-indigo-600 text-white px-4 py-2 rounded-full text-lg font-bold">#{{ routerPage + 1 }}</div>
        <div class="flex items-center gap-4 text-gray-600 text-sm">
          <span v-if="currentBeat?.startTime !== undefined">
            <span class="font-semibold">Start:</span>
            {{ formatDuration(currentBeat.startTime) }}
          </span>
          <span v-if="currentBeat?.duration">
            <span class="font-semibold">Duration:</span>
            {{ formatDuration(currentBeat.duration) }}
          </span>
          <span v-if="currentBeat?.endTime !== undefined">
            <span class="font-semibold">End:</span> {{ formatDuration(currentBeat.endTime) }}
          </span>
        </div>
      </template>

      <template #actions>
        <router-link
          :to="`/contents/${contentsId}/list?beat=${routerPage}&audioLang=${audioLang}&textLang=${textLang}`"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors"
        >
          View List
        </router-link>
      </template>

      <template #mobile-actions>
        <!-- Mobile-only: Settings button -->
        <button
          class="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors sm:hidden"
          @click="showMobileSettings = true"
        >
          ⚙️
        </button>
      </template>
    </MulmoViewerHeader>

    <MulmoViewer
      v-if="data"
      ref="viewerRef"
      v-model:audio-lang="audioLang"
      v-model:text-lang="textLang"
      :data-set="data"
      :base-path="basePath"
      :init-page="routerPage"
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
import MulmoViewerHeader from '../components/mulmo_viewer_header.vue';
import type { MulmoViewerData } from '@mulmocast/types';

const route = useRoute();
const router = useRouter();

type MulmoViewerInstance = InstanceType<typeof MulmoViewer>;
const viewerRef = ref<MulmoViewerInstance | null>(null);

const data = ref<MulmoViewerData | null | undefined>(undefined);
// Initialize language from URL parameter or default to 'en'
const audioLang = ref((route.query.audioLang as string) || 'en');
const textLang = ref((route.query.textLang as string) || 'en');
const playbackSpeed = ref(1);
const showMobileSettings = ref(false);

// Update URL when languages change
watch([audioLang, textLang], ([newAudioLang, newTextLang]) => {
  const query = { ...route.query, audioLang: newAudioLang, textLang: newTextLang };
  void router.replace({ query });
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
    query: route.query,
  });
};

watch(routerPage, (value) => {
  if (viewerRef.value?.updatePage) {
    viewerRef.value.updatePage(value);
  }
});

// Auto-play when coming from list view
const shouldAutoplay = ref(route.query.autoplay === 'true');

watch(
  [data, viewerRef],
  ([newData, newViewerRef]) => {
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
  },
  { immediate: true }
);

const contentsIdParam = route.params.contentsId;
const contentsId = Array.isArray(contentsIdParam) ? contentsIdParam[0] : contentsIdParam;

const basePath = computed(() => {
  return '/' + contentsId;
});

const main = async () => {
  try {
    const res = await fetch('/' + contentsId + '/mulmo_view.json');
    if (res.status === 200) {
      data.value = (await res.json()) as MulmoViewerData;
    } else {
      data.value = null;
    }
  } catch {
    data.value = null;
  }
};

void main();
</script>
