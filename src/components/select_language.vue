<template>
  <select
    :value="modelValue"
    @change="handleLanguageChange"
    class="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg shadow-sm hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-colors cursor-pointer text-base font-medium text-gray-700"
  >
    <option v-for="v in languages" :key="v" :value="v">
      {{ languageNames[v] || v }}
    </option>
  </select>
</template>

<script setup lang="ts">
const languages = ['en', 'ja'];

const languageNames: Record<string, string> = {
  en: 'English',
  ja: '日本語',
};

interface Props {
  modelValue: string;
}
defineProps<Props>();

const emit = defineEmits(['update:modelValue']);

const handleLanguageChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit('update:modelValue', target.value);
};
</script>
