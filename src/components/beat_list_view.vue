<template>
  <div class="space-y-6">
    <div
      v-for="{ beat, originalIndex } in beats"
      :id="`beat-${originalIndex}`"
      :key="originalIndex"
      class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
    >
      <component
        :is="linkComponent"
        :to="linkUrlBuilder ? linkUrlBuilder(originalIndex) : undefined"
        :href="linkUrlBuilder ? linkUrlBuilder(originalIndex) : undefined"
        class="float-left mr-4 mb-2 w-64 flex-shrink-0"
        @click="handleClick(originalIndex, $event)"
      >
        <div class="flex items-center gap-3 mb-2 flex-wrap">
          <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
            #{{ originalIndex + 1 }}
          </span>
          <span v-if="beat.startTime !== undefined" class="text-gray-500 text-sm">
            Start: {{ formatDuration(beat.startTime) }}
          </span>
          <span v-if="beat.duration" class="text-gray-500 text-sm">
            Duration: {{ formatDuration(beat.duration) }}
          </span>
        </div>
        <img
          :src="getImageUrl(originalIndex)"
          :alt="`Beat ${originalIndex + 1}`"
          class="w-full h-auto object-cover rounded-lg hover:opacity-80 transition-opacity shadow-sm"
        />
      </component>

      <p class="text-gray-800 text-base leading-relaxed font-sans">
        {{ getBeatText(beat) }}
      </p>

      <div class="clear-both"></div>
    </div>
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
