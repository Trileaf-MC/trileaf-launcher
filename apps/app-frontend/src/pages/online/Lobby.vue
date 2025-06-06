<script setup lang="ts">
import NavTabs from '@/components/ui/NavTabs.vue'
</script>

<template>
  <div class="p-6 flex flex-col gap-3">
    <NavTabs
      :links="[
        { label: 'Discover', href: `/online/lobby` },
        { label: 'Saved', href: `/online/lobby/saved` },
      ]"
    />
    <RouterView />
  </div>
</template>
