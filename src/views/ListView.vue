<template>
  <div>
    <!-- Fixed Header -->
    <div class="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200">
      <div class="container mx-auto px-4 py-4">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 class="text-2xl font-bold text-gray-800">{{ contentsId }} - Beat List</h1>

          <div v-if="data" class="flex items-center gap-4">
            <div class="flex items-center gap-3">
              <label class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Language:</label>
              <SelectLanguage v-model="textLang" />
            </div>
            <button
              @click="viewMode = viewMode === 'grid' ? 'list' : 'grid'"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors"
            >
              {{ viewMode === 'grid' ? 'Show Full Text' : 'Show Grid' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-8">
      <div v-if="data === undefined" class="text-center py-12">
        <p class="text-gray-600">Loading...</p>
      </div>

      <div v-else-if="data === null" class="text-center py-12">
        <p class="text-red-600 text-xl">404 - Content not found</p>
      </div>

      <!-- Grid View -->
      <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <router-link
        v-for="(beat, index) in data.beats"
        :key="index"
        :to="`/contents/${contentsId}/${index}?textLang=${textLang}`"
        class="group block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
      >
        <div class="relative aspect-video bg-gray-200">
          <img
            :src="`/${contentsId}/${index + 1}.jpg`"
            :alt="`Beat ${index + 1}`"
            class="w-full h-full object-cover"
            @error="handleImageError"
          />
          <div class="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {{ index + 1 }}
          </div>
        </div>
        <div class="p-4">
          <p class="text-gray-700 text-sm line-clamp-3 group-hover:text-indigo-600 transition-colors">
            {{ getBeatText(beat) }}
          </p>
          <div class="text-gray-500 text-xs mt-2 space-y-1">
            <p v-if="beat.startTime !== undefined">
              Start: {{ formatDuration(beat.startTime) }}
            </p>
            <p v-if="beat.duration">
              Duration: {{ formatDuration(beat.duration) }}
            </p>
          </div>
        </div>
      </router-link>
      </div>

      <!-- List View (Full Text) -->
      <div v-else class="space-y-6">
      <div
        v-for="(beat, index) in data.beats"
        :key="index"
        :id="`beat-${index}`"
        class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
      >
        <div class="flex gap-6">
          <router-link
            :to="`/contents/${contentsId}/${index}?audioLang=${textLang}&textLang=${textLang}`"
            class="flex-shrink-0"
          >
            <img
              :src="`/${contentsId}/${index + 1}.jpg`"
              :alt="`Beat ${index + 1}`"
              class="w-48 h-27 object-cover rounded-lg hover:opacity-80 transition-opacity"
              @error="handleImageError"
            />
          </router-link>
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-3 flex-wrap">
              <router-link
                :to="`/contents/${contentsId}/${index}?audioLang=${textLang}&textLang=${textLang}`"
                class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-colors"
              >
                #{{ index + 1 }}
              </router-link>
              <span v-if="beat.startTime !== undefined" class="text-gray-500 text-sm">
                Start: {{ formatDuration(beat.startTime) }}
              </span>
              <span v-if="beat.duration" class="text-gray-500 text-sm">
                Duration: {{ formatDuration(beat.duration) }}
              </span>
            </div>
            <p class="text-gray-800 text-base leading-relaxed font-sans">
              {{ getBeatText(beat) }}
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { type ViewerData, type BundleItem } from '../lib/type';
import SelectLanguage from '../components/select_language.vue';

const route = useRoute();
const router = useRouter();
const data = ref<ViewerData | null | undefined>(undefined);
// Initialize language from URL parameter or default to 'en'
const textLang = ref((route.query.textLang as string) || 'en');
const viewMode = ref<'grid' | 'list'>('list');

const contentsIdParam = route.params.contentsId;
const contentsId = Array.isArray(contentsIdParam) ? contentsIdParam[0] : contentsIdParam;

// Update URL when language changes
watch(textLang, (newLang) => {
  const query = { ...route.query, textLang: newLang };
  router.replace({ query });
});

// Get beat index from query parameter
const scrollToBeat = async () => {
  const beatIndex = route.query.beat;
  if (beatIndex) {
    await nextTick();
    const element = document.getElementById(`beat-${beatIndex}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight effect
      element.classList.add('ring-4', 'ring-indigo-400');
      setTimeout(() => {
        element.classList.remove('ring-4', 'ring-indigo-400');
      }, 2000);
    }
  }
};

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getBeatText = (beat: BundleItem): string => {
  return beat.multiLinguals?.[textLang.value] || beat.text || 'No text available';
};

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  img.src = 'https://via.placeholder.com/400x225?text=No+Thumbnail';
};

const main = async () => {
  try {
    const res = await fetch('/' + contentsId + '/mulmo_view.json');
    if (res.status === 200) {
      data.value = (await res.json()) as ViewerData;
      // Scroll to beat after data is loaded
      await scrollToBeat();
    } else {
      data.value = null;
    }
  } catch {
    data.value = null;
  }
};

void main();
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
