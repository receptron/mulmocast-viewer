<template>
  <div>
    <!-- Fixed Header -->
    <div class="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200">
      <div class="container mx-auto px-4 py-4">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 class="text-2xl font-bold text-gray-800">{{ contentsId }} - Beat List</h1>

          <div v-if="data" class="flex items-center gap-4 flex-wrap">
            <button
              v-if="viewMode === 'list'"
              @click="togglePlayback"
              class="px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
              :class="isPlaying ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'"
            >
              {{ isPlaying ? 'Stop' : 'Play All' }}
            </button>
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
        :to="`/contents/${contentsId}/${index}?textLang=${textLang}&autoplay=true`"
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
            :to="`/contents/${contentsId}/${index}?audioLang=${textLang}&textLang=${textLang}&autoplay=true`"
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
                :to="`/contents/${contentsId}/${index}?audioLang=${textLang}&textLang=${textLang}&autoplay=true`"
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

    <!-- Hidden audio player for list playback -->
    <audio
      ref="audioPlayerRef"
      class="hidden"
      @ended="handleAudioEnded"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onUnmounted } from 'vue';
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

// Audio playback state
const audioPlayerRef = ref<HTMLAudioElement>();
const isPlaying = ref(false);
const currentPlayingIndex = ref(-1);
let scrollTimeout: ReturnType<typeof setTimeout> | null = null;

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
      // Get header height
      const header = document.querySelector('.sticky');
      const headerHeight = header ? header.clientHeight : 0;
      const offset = headerHeight + 16; // Add some padding

      // Scroll immediately to approximate position with header offset
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - offset, behavior: 'instant' });

      // Wait a bit for nearby images to load, then adjust scroll position
      const targetIndex = Number(beatIndex);
      const nearbyImages = document.querySelectorAll(`#beat-${targetIndex} img, #beat-${targetIndex - 1} img, #beat-${targetIndex + 1} img`);

      const imagePromises = Array.from(nearbyImages).map(img => {
        const imgElement = img as HTMLImageElement;
        if (imgElement.complete) return Promise.resolve();
        return new Promise(resolve => {
          imgElement.addEventListener('load', () => resolve(null), { once: true });
          imgElement.addEventListener('error', () => resolve(null), { once: true });
          // Short timeout for quick adjustment
          setTimeout(() => resolve(null), 300);
        });
      });

      await Promise.race([Promise.all(imagePromises), new Promise(resolve => setTimeout(resolve, 500))]);

      // Adjust scroll position after images load
      if (element) {
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: elementPosition - offset, behavior: 'instant' });
      }
    }
  }
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getBeatText = (beat: BundleItem): string => {
  return beat.multiLinguals?.[textLang.value] || beat.text || 'No text available';
};

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  img.src = 'https://via.placeholder.com/400x225?text=No+Thumbnail';
};

// Get currently visible beat
const getVisibleBeatIndex = (): number => {
  if (!data.value) return -1;

  const header = document.querySelector('.sticky');
  const headerHeight = header ? header.clientHeight : 0;
  const viewportTop = window.scrollY + headerHeight + 50;

  for (let i = 0; i < data.value.beats.length; i++) {
    const element = document.getElementById(`beat-${i}`);
    if (element) {
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + window.scrollY;
      if (elementTop >= viewportTop - 100) {
        return i;
      }
    }
  }
  return data.value.beats.length - 1;
};

// Play audio for a specific beat
const playBeat = (index: number) => {
  if (!data.value || !audioPlayerRef.value) return;

  const beat = data.value.beats[index];
  const audioSource = beat.audioSources?.[textLang.value];

  if (audioSource) {
    currentPlayingIndex.value = index;
    audioPlayerRef.value.src = `/${contentsId}/${audioSource}`;
    audioPlayerRef.value.play().catch(() => {
      console.log('Playback failed');
      isPlaying.value = false;
    });

    // Scroll to beat
    const element = document.getElementById(`beat-${index}`);
    if (element) {
      const header = document.querySelector('.sticky');
      const headerHeight = header ? header.clientHeight : 0;
      const offset = headerHeight + 16;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  }
};

// Handle audio ended
const handleAudioEnded = () => {
  if (!isPlaying.value || !data.value) return;

  const nextIndex = currentPlayingIndex.value + 1;
  if (nextIndex < data.value.beats.length) {
    playBeat(nextIndex);
  } else {
    isPlaying.value = false;
    currentPlayingIndex.value = -1;
  }
};

// Toggle playback
const togglePlayback = () => {
  if (isPlaying.value) {
    // Stop playback
    isPlaying.value = false;
    currentPlayingIndex.value = -1;
    if (audioPlayerRef.value) {
      audioPlayerRef.value.pause();
      audioPlayerRef.value.src = '';
    }
  } else {
    // Start playback from visible beat
    isPlaying.value = true;
    const visibleIndex = getVisibleBeatIndex();
    playBeat(visibleIndex >= 0 ? visibleIndex : 0);
  }
};

// Handle user scroll
const handleScroll = () => {
  if (!isPlaying.value) return;

  // Clear existing timeout
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }

  // Set new timeout to detect scroll stop
  scrollTimeout = setTimeout(() => {
    const visibleIndex = getVisibleBeatIndex();
    if (visibleIndex >= 0 && visibleIndex !== currentPlayingIndex.value) {
      playBeat(visibleIndex);
    }
  }, 500); // Wait 500ms after scroll stops
};

// Setup scroll listener
watch([isPlaying, viewMode], ([playing, mode]) => {
  if (playing && mode === 'list') {
    window.addEventListener('scroll', handleScroll);
  } else {
    window.removeEventListener('scroll', handleScroll);
  }
});

// Cleanup on unmount
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
});

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
