<template>
  <div>
    <!-- Fixed Header -->
    <MulmoViewerHeader
      v-if="data"
      v-model:audio-lang="audioLang"
      v-model:text-lang="textLang"
      v-model:playback-speed="playbackSpeed"
      v-model:show-mobile-settings="showMobileSettings"
      :show-speed-control="viewMode === 'list'"
      :show-audio-lang="viewMode === 'list'"
      :hide-desktop-controls="isPlaying && viewMode === 'list'"
      :sticky="true"
    >
      <template #left>
        <h1
          class="text-xl sm:text-2xl font-bold text-gray-800"
          :class="{ 'hidden sm:block': isPlaying && viewMode === 'list' }"
        >
          {{ contentsId }} - Beat List
        </h1>
      </template>

      <template #actions>
        <!-- Play/Stop button - always visible -->
        <button
          v-if="viewMode === 'list'"
          class="px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
          :class="isPlaying ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'"
          @click="togglePlayback"
        >
          {{ isPlaying ? 'Stop' : 'Play All' }}
        </button>

        <!-- Desktop-only controls (hidden on mobile when playing) -->
        <template v-if="!isPlaying || viewMode !== 'list'">
          <button
            class="px-4 py-2 rounded-lg font-medium shadow-sm transition-colors hidden sm:inline-block"
            :class="
              showDigestOnly ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-gray-600 hover:bg-gray-700 text-white'
            "
            @click="showDigestOnly = !showDigestOnly"
          >
            {{ showDigestOnly ? 'Show All' : 'Digest' }}
          </button>
          <button
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors hidden sm:inline-block"
            @click="viewMode = viewMode === 'grid' ? 'list' : 'grid'"
          >
            {{ viewMode === 'grid' ? 'Show Full Text' : 'Show Grid' }}
          </button>
        </template>
      </template>

      <template #mobile-actions>
        <!-- Mobile-only: Digest button when not playing -->
        <button
          v-if="!isPlaying"
          class="px-4 py-2 rounded-lg font-medium shadow-sm transition-colors sm:hidden"
          :class="
            showDigestOnly ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-gray-600 hover:bg-gray-700 text-white'
          "
          @click="showDigestOnly = !showDigestOnly"
        >
          {{ showDigestOnly ? 'Show All' : 'Digest' }}
        </button>

        <!-- Mobile-only: Settings button -->
        <button
          class="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors sm:hidden"
          @click="showMobileSettings = true"
        >
          ⚙️
        </button>

        <!-- Mobile-only: View mode toggle when not playing -->
        <button
          v-if="!isPlaying"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors sm:hidden"
          @click="viewMode = viewMode === 'grid' ? 'list' : 'grid'"
        >
          {{ viewMode === 'grid' ? 'Full Text' : 'Grid' }}
        </button>
      </template>
    </MulmoViewerHeader>

    <div class="container mx-auto px-4 py-8">
      <div v-if="data === undefined" class="text-center py-12">
        <p class="text-gray-600">Loading...</p>
      </div>

      <div v-else-if="data === null" class="text-center py-12">
        <p class="text-red-600 text-xl">404 - Content not found</p>
      </div>

      <!-- Grid View -->
      <BeatGridView
        v-else-if="viewMode === 'grid'"
        :beats="filteredBeats"
        :base-path="`/${contentsId}`"
        :text-lang="textLang"
        :link-url-builder="getBeatLinkUrl"
        :link-component="RouterLink"
      />

      <!-- List View (Full Text) -->
      <BeatListView
        v-else
        :beats="filteredBeats"
        :base-path="`/${contentsId}`"
        :text-lang="textLang"
        :link-url-builder="getBeatLinkUrl"
        :link-component="RouterLink"
      />
    </div>

    <!-- Hidden audio player for list playback -->
    <audio ref="audioPlayerRef" class="hidden" @ended="handleAudioEnded" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onUnmounted } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import type { MulmoViewerData } from '@mulmocast/types';
import MulmoViewerHeader from '../components/mulmo_viewer_header.vue';
import BeatGridView from '../components/beat_grid_view.vue';
import BeatListView from '../components/beat_list_view.vue';

const route = useRoute();
const router = useRouter();
const data = ref<MulmoViewerData | null | undefined>(undefined);
// Initialize language from URL parameter or default to 'en'
const audioLang = ref((route.query.audioLang as string) || 'en');
const textLang = ref((route.query.textLang as string) || 'en');
const viewMode = ref<'grid' | 'list'>('list');
const showDigestOnly = ref(false);
const playbackSpeed = ref(1);
const showMobileSettings = ref(false);

const contentsIdParam = route.params.contentsId;
const contentsId = Array.isArray(contentsIdParam) ? contentsIdParam[0] : contentsIdParam;

// Filtered beats based on digest mode with original indices
const filteredBeats = computed(() => {
  if (!data.value?.beats) return [];
  const beatsWithIndex = data.value.beats.map((beat, index) => ({ beat, originalIndex: index }));
  if (!showDigestOnly.value) return beatsWithIndex;
  return beatsWithIndex.filter(({ beat }) => (beat.importance ?? 0) >= 7);
});

// Audio playback state
const audioPlayerRef = ref<HTMLAudioElement>();
const isPlaying = ref(false);
const currentPlayingIndex = ref(-1);
let scrollTimeout: ReturnType<typeof setTimeout> | null = null;

// Update URL when languages change
watch([audioLang, textLang], ([newAudioLang, newTextLang], [oldAudioLang]) => {
  const query = { ...route.query, audioLang: newAudioLang, textLang: newTextLang };
  void router.replace({ query });

  // If audio language changed while playing, restart current beat
  if (isPlaying.value && newAudioLang !== oldAudioLang && currentPlayingIndex.value >= 0) {
    playBeat(currentPlayingIndex.value);
  }
});

// Update playback speed when changed
watch(playbackSpeed, (newSpeed) => {
  if (audioPlayerRef.value) {
    audioPlayerRef.value.playbackRate = newSpeed;
  }
});

// Update URL when current playing index changes
watch(currentPlayingIndex, (newIndex) => {
  if (newIndex >= 0) {
    const query = { ...route.query, beat: newIndex.toString() };
    void router.replace({ query });
  }
});

// When digest mode changes, ensure current beat is visible or scroll to first available beat
watch(showDigestOnly, async () => {
  await nextTick();

  // Get current beat from URL
  const currentBeat = route.query.beat;
  if (currentBeat) {
    const beatNum = Number(Array.isArray(currentBeat) ? currentBeat[0] : currentBeat);

    // Check if current beat is in filtered beats
    const isCurrentBeatVisible = filteredBeats.value.some(({ originalIndex }) => originalIndex === beatNum);

    if (isCurrentBeatVisible) {
      // Current beat is visible, scroll to it
      await scrollToBeat();
    } else if (filteredBeats.value.length > 0) {
      // Current beat not visible, scroll to first filtered beat
      const firstBeat = filteredBeats.value[0];
      if (firstBeat) {
        const query = { ...route.query, beat: firstBeat.originalIndex.toString() };
        void router.replace({ query });
        await scrollToBeat();
      }
    }
  }
});

// Get beat index from query parameter
const scrollToBeat = async () => {
  const beatIndex = route.query.beat;
  if (beatIndex) {
    await nextTick();

    const beatIndexStr = Array.isArray(beatIndex) ? beatIndex[0] : beatIndex;
    const element = document.getElementById(`beat-${beatIndexStr}`);
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
      const nearbyImages = document.querySelectorAll(
        `#beat-${targetIndex} img, #beat-${targetIndex - 1} img, #beat-${targetIndex + 1} img`
      );

      const imagePromises = Array.from(nearbyImages).map((img) => {
        const imgElement = img as HTMLImageElement;
        if (imgElement.complete) return Promise.resolve();
        return new Promise((resolve) => {
          imgElement.addEventListener('load', () => resolve(null), { once: true });
          imgElement.addEventListener('error', () => resolve(null), { once: true });
          // Short timeout for quick adjustment
          setTimeout(() => resolve(null), 300);
        });
      });

      await Promise.race([Promise.all(imagePromises), new Promise((resolve) => setTimeout(resolve, 500))]);

      // Adjust scroll position after images load
      // eslint-disable-next-line sonarjs/no-gratuitous-expressions
      if (element) {
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: elementPosition - offset, behavior: 'instant' });
      }
    }
  }
};

const getBeatLinkUrl = (index: number): string => {
  return `/contents/${contentsId}/${index}?audioLang=${audioLang.value}&textLang=${textLang.value}&autoplay=true`;
};

// Get currently visible beat
const getVisibleBeatIndex = (): number => {
  if (!data.value) return -1;

  const header = document.querySelector('.sticky');
  const headerHeight = header ? header.clientHeight : 0;
  const viewportTop = window.scrollY + headerHeight + 50;

  // Check only filtered beats
  for (const { originalIndex } of filteredBeats.value) {
    const element = document.getElementById(`beat-${originalIndex}`);
    if (element) {
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + window.scrollY;
      if (elementTop >= viewportTop - 100) {
        return originalIndex;
      }
    }
  }
  // Return the last filtered beat's original index
  const lastFiltered = filteredBeats.value[filteredBeats.value.length - 1];
  return lastFiltered ? lastFiltered.originalIndex : data.value.beats.length - 1;
};

// Play audio for a specific beat
const playBeat = (index: number) => {
  if (!data.value || !audioPlayerRef.value) return;

  const beat = data.value.beats[index];
  if (!beat) return;

  const audioSource = beat.audioSources?.[audioLang.value];

  if (audioSource) {
    currentPlayingIndex.value = index;
    audioPlayerRef.value.pause();
    audioPlayerRef.value.currentTime = 0;
    audioPlayerRef.value.src = `/${contentsId}/${audioSource}`;
    audioPlayerRef.value.playbackRate = playbackSpeed.value;
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
  // Early return if not playing or no data
  if (!isPlaying.value || !data.value) return;

  // Double-check isPlaying in case stop was called during event propagation
  if (!isPlaying.value) return;

  // Find the next beat in filtered beats
  const currentFilteredIndex = filteredBeats.value.findIndex(
    ({ originalIndex }) => originalIndex === currentPlayingIndex.value
  );

  if (currentFilteredIndex >= 0 && currentFilteredIndex + 1 < filteredBeats.value.length) {
    const nextBeat = filteredBeats.value[currentFilteredIndex + 1];
    if (nextBeat && isPlaying.value) {
      playBeat(nextBeat.originalIndex);
    }
  } else {
    isPlaying.value = false;
    currentPlayingIndex.value = -1;
  }
};

// Toggle playback
const togglePlayback = () => {
  if (isPlaying.value) {
    // Stop playback - set flag first to prevent handleAudioEnded from continuing
    isPlaying.value = false;
    currentPlayingIndex.value = -1;

    // Clear any pending scroll timeout to prevent auto-restart
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
      scrollTimeout = null;
    }

    if (audioPlayerRef.value) {
      // Pause and clear the source to fully stop
      audioPlayerRef.value.pause();
      audioPlayerRef.value.currentTime = 0;
      audioPlayerRef.value.src = '';
      // Force reload to ensure stopped state
      audioPlayerRef.value.load();
    }
  } else {
    // Start playback from visible beat
    if (filteredBeats.value.length === 0) return; // No beats to play

    isPlaying.value = true;
    const visibleIndex = getVisibleBeatIndex();
    if (visibleIndex >= 0) {
      playBeat(visibleIndex);
    } else {
      // Play first filtered beat if no visible beat found
      const firstBeat = filteredBeats.value[0];
      if (firstBeat) {
        playBeat(firstBeat.originalIndex);
      }
    }
  }
};

// Handle user scroll
const handleScroll = () => {
  // Double-check isPlaying state
  if (!isPlaying.value) return;

  // Clear existing timeout
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }

  // Set new timeout to detect scroll stop
  scrollTimeout = setTimeout(() => {
    // Check again if still playing (user might have stopped during timeout)
    if (!isPlaying.value) return;

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
      data.value = (await res.json()) as MulmoViewerData;
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
