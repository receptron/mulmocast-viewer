<script setup lang="ts"></script>

<template>
  <div id="app">
    <header></header>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
header {
  background-color: #f5f5f5;
  padding: 1rem;
  margin-bottom: 2rem;
}

nav {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

nav a {
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: #333;
  border-radius: 4px;
  transition: background-color 0.3s;
}

nav a:hover {
  background-color: #e0e0e0;
}

nav a.router-link-active {
  background-color: #42b883;
  color: white;
}

main {
  padding: 0 2rem;
}
</style>
