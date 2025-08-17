<template>
  <div class="p-6 flex flex-col gap-6">
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
    </div>

    <div v-else-if="!server" class="text-center py-12">
      <h2 class="text-xl font-bold text-secondary mb-2">服务器未找到</h2>
      <p class="text-secondary mb-4">请检查服务器ID是否正确</p>
      <button
        @click="$router.push('/')"
        class="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
      >
        返回大厅
      </button>
    </div>

    <div v-else>
      <!-- 服务器头部信息 -->
      <div class="bg-bg-raised border border-divider rounded-lg p-6">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h1 class="text-3xl font-bold mb-2">{{ server.serverName }}</h1>
            <p v-if="server.description" class="text-secondary mb-4">{{ server.description }}</p>
            <div class="flex items-center gap-4 text-sm">
              <div class="flex items-center gap-2">
                <div 
                  class="w-3 h-3 rounded-full" 
                  :class="getStatusColor(server.currentPlayers, server.maxPlayers)"
                ></div>
                <span>{{ server.currentPlayers }}/{{ server.maxPlayers }} 在线</span>
              </div>
              <span v-if="server.ping" :class="getPingColor(server.ping)">
                延迟: {{ server.ping }}ms
              </span>
              <span v-if="server.isOnlineMode" class="text-green-600">正版验证</span>
            </div>
          </div>
          <button
            @click="joinServer"
            :disabled="joining"
            class="px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {{ joining ? '准备中...' : '一键加入' }}
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div class="bg-bg p-4 rounded-lg">
            <h3 class="font-semibold mb-2">服务器信息</h3>
            <div class="space-y-1 text-secondary">
              <p>地址: {{ server.serverIp }}:{{ server.serverPort }}</p>
              <p>版本: {{ server.minecraftVersion }}</p>
              <p>模式: {{ server.gameMode }}</p>
              <p>难度: {{ server.difficulty }}</p>
            </div>
          </div>
          
          <div class="bg-bg p-4 rounded-lg">
            <h3 class="font-semibold mb-2">玩家统计</h3>
            <div class="space-y-1 text-secondary">
              <p>当前在线: {{ server.currentPlayers }}</p>
              <p>最大人数: {{ server.maxPlayers }}</p>
              <p>在线率: {{ Math.round((server.currentPlayers / server.maxPlayers) * 100) }}%</p>
            </div>
          </div>

          <div class="bg-bg p-4 rounded-lg">
            <h3 class="font-semibold mb-2">服务器类型</h3>
            <div class="space-y-2">
              <span 
                class="inline-block px-3 py-1 rounded-full text-xs font-medium"
                :class="getCategoryStyle(server.category)"
              >
                {{ getCategoryLabel(server.category) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 在线玩家列表 -->
      <div class="bg-bg-raised border border-divider rounded-lg p-6">
        <h2 class="text-xl font-bold mb-4">在线玩家</h2>
        <div v-if="onlinePlayers.length === 0" class="text-center py-8 text-secondary">
          暂无在线玩家信息
        </div>
        <div v-else class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div
            v-for="player in onlinePlayers"
            :key="player.uuid"
            class="flex flex-col items-center gap-2 p-3 bg-bg rounded-lg"
          >
            <div class="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
              <img 
                :src="`https://crafatar.com/avatars/${player.uuid}?size=48`"
                :alt="player.name"
                class="w-full h-full object-cover"
                @error="onAvatarError"
              />
            </div>
            <span class="text-sm font-medium truncate max-w-full">{{ player.name }}</span>
          </div>
        </div>
      </div>

      <!-- 服务器模组信息 -->
      <div v-if="serverMods.length > 0" class="bg-bg-raised border border-divider rounded-lg p-6">
        <h2 class="text-xl font-bold mb-4">所需模组</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="mod in serverMods"
            :key="mod.id"
            class="flex items-center gap-3 p-3 bg-bg rounded-lg"
          >
            <div class="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
              <span class="text-xs font-bold">{{ mod.name.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="flex-1">
              <h3 class="font-medium">{{ mod.name }}</h3>
              <p class="text-sm text-secondary">版本: {{ mod.version }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBreadcrumbs } from '@/store/breadcrumbs'
import { handleError } from '@/store/notifications.js'
import { getServerDetails, serverCategories } from '@/helpers/servers'
import type { ServerInfo } from '@/helpers/types'

const route = useRoute()
const router = useRouter()
const breadcrumbs = useBreadcrumbs()

const server = ref<ServerInfo | null>(null)
const loading = ref(true)
const joining = ref(false)

// 模拟数据，实际应该从API获取
const onlinePlayers = ref([
  { uuid: '069a79f4-44e9-4726-a5be-fca90e38aaf5', name: 'Steve' },
  { uuid: '853c80ef-3c37-49fd-aa49-938b674adae6', name: 'Alex' },
  { uuid: 'f84c6a79-0a4e-45e0-879b-cd49ebd4c4e2', name: 'Notch' },
  { uuid: 'b0b4b7ad-6b76-4d37-9c8a-3b4e8a7f3d92', name: 'Jeb_' },
  { uuid: 'c9c8b5e4-2f1a-4d3c-9b8a-1e2f3a4b5c6d', name: 'Dinnerbone' },
  { uuid: 'd1e2f3a4-b5c6-4d7e-8f9a-0b1c2d3e4f5a', name: 'Grumm' },
  { uuid: 'e4f5a6b7-c8d9-4e0f-1a2b-3c4d5e6f7a8b', name: 'CaptainSparklez' },
  { uuid: 'f7a8b9c0-d1e2-4f3a-4b5c-6d7e8f9a0b1c', name: 'DanTDM' },
])

const serverMods = ref([
  { id: 'jei', name: 'JEI (Just Enough Items)', version: '1.20.1-15.2.0.27' },
  { id: 'create', name: 'Create', version: '1.20.1-0.5.1' },
  { id: 'ironchest', name: 'Iron Chests', version: '1.20.1-14.4.4' },
  { id: 'waystones', name: 'Waystones', version: '1.20.1-14.1.3' },
  { id: 'journeymap', name: 'JourneyMap', version: '1.20.1-5.9.18' },
  { id: 'appleskin', name: 'AppleSkin', version: '1.20.1-2.5.1' },
])

// 根据服务器类型动态显示不同的模组
function getServerMods(serverId: string) {
  const modSets = {
    '1': [ // 三叶生存服
      { id: 'grief-prevention', name: 'GriefPrevention', version: '1.20.1-16.18.1' },
      { id: 'essentials', name: 'EssentialsX', version: '2.20.1' },
      { id: 'vault', name: 'Vault', version: '1.7.3' },
    ],
    '3': [ // 机械动力整合包服
      { id: 'create', name: 'Create', version: '1.20.1-0.5.1' },
      { id: 'createaddition', name: 'Create Crafts & Additions', version: '1.20.1-1.2.3' },
      { id: 'jei', name: 'JEI (Just Enough Items)', version: '1.20.1-15.2.0.27' },
      { id: 'ironchest', name: 'Iron Chests', version: '1.20.1-14.4.4' },
      { id: 'thermal', name: 'Thermal Foundation', version: '1.20.1-11.0.1' },
    ],
    '7': [ // 神奇宝贝服
      { id: 'pixelmon', name: 'Pixelmon Reforged', version: '9.1.12' },
      { id: 'journeymap', name: 'JourneyMap', version: '1.16.5-5.8.5' },
      { id: 'waystones', name: 'Waystones', version: '1.16.5-7.6.4' },
    ],
    '10': [ // 怪物猎人服
      { id: 'mhfc', name: 'Monster Hunter Frontier Craft', version: '1.19.4-0.6.2' },
      { id: 'jei', name: 'JEI (Just Enough Items)', version: '1.19.4-11.6.0' },
      { id: 'tinkers', name: 'Tinkers Construct', version: '1.19.4-3.7.1' },
    ],
    '12': [ // 魔法世界
      { id: 'thaumcraft', name: 'Thaumcraft', version: '1.18.2-6.1.6' },
      { id: 'botania', name: 'Botania', version: '1.18.2-1.20.1' },
      { id: 'bloodmagic', name: 'Blood Magic', version: '1.18.2-3.2.6' },
      { id: 'astral', name: 'Astral Sorcery', version: '1.18.2-1.16.5' },
    ]
  }
  
  return modSets[serverId as keyof typeof modSets] || []
}

async function fetchServerDetails() {
  const serverId = route.params.id as string
  if (!serverId) {
    router.push('/')
    return
  }

  loading.value = true
  
  try {
    const serverData = await getServerDetails(serverId)
    if (serverData) {
      server.value = serverData
      // 根据服务器ID动态设置模组列表
      const specificMods = getServerMods(serverId)
      if (specificMods.length > 0) {
        serverMods.value = specificMods
      }
      breadcrumbs.setRootContext({ 
        name: serverData.serverName, 
        link: route.path 
      })
    }
  } catch (error) {
    handleError(error)
  } finally {
    loading.value = false
  }
}

async function joinServer() {
  if (!server.value || joining.value) return
  
  joining.value = true
  
  try {
    // 这里应该调用后端API来处理服务器加入逻辑
    // 1. 检查是否需要下载模组
    // 2. 创建或更新游戏实例
    // 3. 启动游戏
    
    console.log('Joining server:', server.value.serverName)
    
    // 模拟加入过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 加入成功后的处理
    alert(`正在准备加入服务器: ${server.value.serverName}`)
    
  } catch (error) {
    handleError(error)
  } finally {
    joining.value = false
  }
}

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

function onAvatarError(event: Event) {
  const target = event.target as HTMLImageElement
  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzNkMzMC42Mjc0IDM2IDM2IDMwLjYyNzQgMzYgMjRDMzYgMTcuMzcyNiAzMC42Mjc0IDEyIDI0IDEyQzE3LjM3MjYgMTIgMTIgMTcuMzcyNiAxMiAyNEMxMiAzMC42Mjc0IDE3LjM3MjYgMzYgMjQgMzZaIiBmaWxsPSIjOUI5QjlCIi8+Cjwvc3ZnPgo='
}

onMounted(() => {
  fetchServerDetails()
})
</script>