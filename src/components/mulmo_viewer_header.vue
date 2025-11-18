<template>
  <div class="bg-white shadow-md border-b border-gray-200" :class="{ 'sticky top-0 z-50': sticky }">
    <div class="container mx-auto px-4 py-2 sm:py-4">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
        <!-- Left side - slot for custom content (title, beat info, etc.) -->
        <div class="flex items-center gap-4 flex-wrap">
          <slot name="left" />
        </div>

        <!-- Right side - controls -->
        <div class="flex items-center gap-2 sm:gap-4 flex-wrap w-full sm:w-auto">
          <!-- Custom action buttons slot -->
          <slot name="actions" />

          <!-- Desktop controls - hidden on mobile when hideOnMobile is true -->
          <template v-if="!hideDesktopControls">
            <!-- Speed Control (only in list mode) -->
            <div v-if="showSpeedControl" class="hidden sm:flex items-center gap-3">
              <label class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Speed:</label>
              <select
                :value="playbackSpeed"
                class="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                @change="$emit('update:playbackSpeed', Number(($event.target as HTMLSelectElement).value))"
              >
                <option :value="1">1x</option>
                <option :value="1.25">1.25x</option>
                <option :value="1.5">1.5x</option>
                <option :value="1.75">1.75x</option>
                <option :value="2">2x</option>
              </select>
            </div>

            <!-- Audio Language -->
            <div v-if="showAudioLang" class="hidden sm:flex items-center gap-3">
              <label class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Audio:</label>
              <SelectLanguage :model-value="audioLang" @update:model-value="$emit('update:audioLang', $event)" />
            </div>

            <!-- Text Language -->
            <div class="hidden sm:flex items-center gap-3">
              <label class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Text:</label>
              <SelectLanguage :model-value="textLang" @update:model-value="$emit('update:textLang', $event)" />
            </div>
          </template>

          <!-- Mobile-only controls slot -->
          <slot name="mobile-actions" />
        </div>
      </div>
    </div>
  </div>

  <!-- Mobile Settings Modal -->
  <div
    v-if="showMobileSettings"
    class="fixed inset-0 bg-black bg-opacity-50 z-50 sm:hidden"
    @click="$emit('update:showMobileSettings', false)"
  >
    <div class="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl p-6 space-y-4" @click.stop>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-gray-800">Settings</h2>
        <button class="text-gray-500 hover:text-gray-700 text-2xl" @click="$emit('update:showMobileSettings', false)">
          ×
        </button>
      </div>

      <!-- Speed Control -->
      <div v-if="showSpeedControl" class="space-y-2">
        <label class="text-sm font-semibold text-gray-700 uppercase tracking-wide block">Playback Speed</label>
        <select
          :value="playbackSpeed"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          @change="$emit('update:playbackSpeed', Number(($event.target as HTMLSelectElement).value))"
        >
          <option :value="1">1x (Normal)</option>
          <option :value="1.25">1.25x</option>
          <option :value="1.5">1.5x</option>
          <option :value="1.75">1.75x</option>
          <option :value="2">2x (Double)</option>
        </select>
      </div>

      <!-- Audio Language -->
      <div v-if="showAudioLang" class="space-y-2">
        <label class="text-sm font-semibold text-gray-700 uppercase tracking-wide block">Audio Language</label>
        <SelectLanguage
          :model-value="audioLang"
          class="w-full"
          @update:model-value="$emit('update:audioLang', $event)"
        />
      </div>

      <!-- Text Language -->
      <div class="space-y-2">
        <label class="text-sm font-semibold text-gray-700 uppercase tracking-wide block">Text Language</label>
        <SelectLanguage :model-value="textLang" class="w-full" @update:model-value="$emit('update:textLang', $event)" />
      </div>

      <!-- Close Button -->
      <button
        class="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors mt-4"
        @click="$emit('update:showMobileSettings', false)"
      >
        Done
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import SelectLanguage from './select_language.vue';

interface Props {
  audioLang: string;
  textLang: string;
  playbackSpeed?: number;
  showSpeedControl?: boolean;
  showAudioLang?: boolean;
  hideDesktopControls?: boolean;
  showMobileSettings?: boolean;
  sticky?: boolean;
}

withDefaults(defineProps<Props>(), {
  playbackSpeed: 1,
  showSpeedControl: true,
  showAudioLang: true,
  hideDesktopControls: false,
  showMobileSettings: false,
  sticky: false,
});

defineEmits<{
  'update:audioLang': [lang: string];
  'update:textLang': [lang: string];
  'update:playbackSpeed': [speed: number];
  'update:showMobileSettings': [show: boolean];
}>();
</script>
