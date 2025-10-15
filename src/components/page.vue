<template>
  <div
    ref="containerRef"
    class="items-center justify-center w-full"
    >
    <div class="text-sm text-gray-600 mb-2">{{ (data as any)?.imagePath }}</div>
    <div class="items-center justify-center w-full mb-4">
      <img
        :src="`${basePath}/${(data as any)?.imagePath}`"
        class="max-w-full max-h-full object-contain"
      />
    </div>
    <audio
      :src="`${basePath}/${(data as any)?.audio}`"
      :controls="true"
      class="w-full"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  data: unknown;
  basePath: string;
  index: number;
}
defineProps<Props>();

const containerRef = ref<HTMLElement | null>(null);
</script>
