<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    <component
      :is="linkComponent"
      v-for="{ beat, originalIndex } in beats"
      :key="originalIndex"
      :to="linkUrlBuilder ? linkUrlBuilder(originalIndex) : undefined"
      :href="linkUrlBuilder ? linkUrlBuilder(originalIndex) : undefined"
      class="group block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
      @click="handleClick(originalIndex, $event)"
    >
      <div class="relative aspect-video bg-gray-200">
        <img
          :src="getImageUrl(originalIndex)"
          :alt="`Beat ${originalIndex + 1}`"
          class="w-full h-full object-cover"
        />
        <div
          class="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-semibold"
        >
          {{ originalIndex + 1 }}
        </div>
      </div>
      <div class="p-4">
        <p class="text-gray-700 text-sm line-clamp-3 group-hover:text-indigo-600 transition-colors">
          {{ getBeatText(beat) }}
        </p>
        <div class="text-gray-500 text-xs mt-2 space-y-1">
          <p v-if="beat.startTime !== undefined">Start: {{ formatDuration(beat.startTime) }}</p>
          <p v-if="beat.duration">Duration: {{ formatDuration(beat.duration) }}</p>
        </div>
      </div>
    </component>
  </div>
</template>

<script setup lang="ts">
import { type BundleItem } from '../lib/type';

interface Props {
  beats: Array<{ beat: BundleItem; originalIndex: number }>;
  basePath?: string;
  textLang?: string;
  linkUrlBuilder?: (index: number) => string;
  linkComponent?: string | object;
}

const props = withDefaults(defineProps<Props>(), {
  basePath: '',
  textLang: 'en',
  linkComponent: 'a',
});

const emit = defineEmits<{
  'beat-click': [index: number];
}>();

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
  return beat.multiLinguals?.[props.textLang] || beat.text || 'No text available';
};

const getImageUrl = (index: number): string => {
  return `${props.basePath}/${index + 1}.jpg`;
};

const handleClick = (index: number, event: Event) => {
  // If using router-link, don't prevent default
  if (props.linkComponent === 'a' && props.linkUrlBuilder) {
    event.preventDefault();
  }
  emit('beat-click', index);
};
</script>
