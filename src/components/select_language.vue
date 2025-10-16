<template>
  <select :value="modelValue" @change="handleLanguageChange">
    <option v-for="v in languages" :key="v" :value="v">
      {{ v }}
    </option>
  </select>
</template>

<script setup lang="ts">
const languages = ['en', 'ja'];

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
