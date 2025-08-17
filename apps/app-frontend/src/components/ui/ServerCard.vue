<template>
  <div
    class="bg-bg-raised border border-divider rounded-lg p-4 hover:border-brand-500 transition-colors cursor-pointer group"
    @click="$emit('click', server)"
  >
    <div class="flex items-start justify-between mb-3">
      <h3 class="font-semibold text-lg truncate pr-2 group-hover:text-brand-500 transition-colors">
        {{ server.serverName }}
      </h3>
      <div class="flex items-center gap-2 text-sm text-secondary">
        <div 
          class="w-2 h-2 rounded-full" 
          :class="getStatusColor(server.currentPlayers, server.maxPlayers)"
        ></div>
        {{ server.currentPlayers }}/{{ server.maxPlayers }}
      </div>
    </div>
    
    <div class="text-sm text-secondary space-y-1 mb-3">
      <p class="flex items-center gap-2">
        <span class="text-xs">🌐</span>
        {{ server.serverIp }}:{{ server.serverPort }}
      </p>
      <p class="flex items-center gap-2">
        <span class="text-xs">⚙️</span>
        版本: {{ server.minecraftVersion }}
      </p>
      <p class="flex items-center gap-2">
        <span class="text-xs">🎮</span>
        {{ server.gameMode }} | {{ server.difficulty }}
      </p>
      <p v-if="server.description" class="text-xs line-clamp-2">
        {{ server.description }}
      </p>
      <p v-if="server.dailyActiveUsers" class="text-xs text-secondary">
        日活: {{ server.dailyActiveUsers }} 人
      </p>
    </div>

    <div class="flex items-center justify-between text-xs">
      <span 
        class="px-2 py-1 rounded-full font-medium"
        :class="getCategoryStyle(server.category)"
      >
        {{ getCategoryLabel(server.category) }}
      </span>
      <div class="flex items-center gap-3">
        <span v-if="server.isOnlineMode" class="text-green-600" title="正版验证">
          🔒
        </span>
        <span v-if="server.ping" class="text-secondary" :class="getPingColor(server.ping)">
          {{ server.ping }}ms
        </span>
        <span v-if="server.averageTps" class="text-xs" :class="getTpsColor(server.averageTps)" title="TPS">
          TPS: {{ server.averageTps.toFixed(1) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ServerInfo } from '@/helpers/types'
import { serverCategories } from '@/helpers/servers'

interface Props {
  server: ServerInfo
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [server: ServerInfo]
}>()

function getStatusColor(current: number, max: number) {
  const ratio = current / max
  if (ratio > 0.8) return 'bg-red-500'
  if (ratio > 0.6) return 'bg-yellow-500'
  return 'bg-green-500'
}

function getCategoryStyle(category?: string) {
  const categoryColors = {
    survival: 'bg-green-100 text-green-800',
    creative: 'bg-blue-100 text-blue-800',
    modded: 'bg-purple-100 text-purple-800',
    'mini-games': 'bg-orange-100 text-orange-800',
    pvp: 'bg-red-100 text-red-800',
  }
  return categoryColors[category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800'
}

function getCategoryLabel(category?: string) {
  const found = serverCategories.find(cat => cat.key === category)
  return found?.label || '未分类'
}

function getPingColor(ping: number) {
  if (ping > 200) return 'text-red-500'
  if (ping > 100) return 'text-yellow-500'
  return 'text-green-500'
}

function getTpsColor(tps: number) {
  if (tps < 16) return 'text-red-500'
  if (tps < 18) return 'text-yellow-500'
  return 'text-green-500'
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>