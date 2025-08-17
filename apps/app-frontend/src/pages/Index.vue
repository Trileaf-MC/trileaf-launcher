/*
 * Copyright © 2025 LeavesWebber
 * 
 * SPDX-License-Identifier: MPL-2.0
 * 
 * Feel free to contact LeavesWebber@outlook.com
 */

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBreadcrumbs } from '@/store/breadcrumbs'
import { handleError } from '@/store/notifications.js'
import { getServerList, serverCategories } from '@/helpers/servers'
import { list } from '@/helpers/profile.js'
import { profile_listener } from '@/helpers/events'
import type { ServerInfo, ServerCategory, GameInstance, ServerFilterOptions, ServerSortBy } from '@/helpers/types'
import NavTabs from '@/components/ui/NavTabs.vue'
import ServerCard from '@/components/ui/ServerCard.vue'
import ServerFilter from '@/components/ui/ServerFilter.vue'

const route = useRoute()
const router = useRouter()
const breadcrumbs = useBreadcrumbs()

breadcrumbs.setRootContext({ name: '联机大厅', link: route.path })

const servers = ref<ServerInfo[]>([])
const loading = ref(false)
const currentCategory = ref<ServerCategory>('all')
const hasMore = ref(false)
const nextCursor = ref<string>()
const searchQuery = ref('')
const searchDebounceTimer = ref<number>()
const instances = ref<GameInstance[]>([])
const filters = ref<ServerFilterOptions | undefined>()
const sortBy = ref<ServerSortBy | undefined>()

// 初始化游戏实例列表 - 这是 Tauri 应用必需的
async function fetchInstances() {
  try {
    instances.value = await list()
  } catch (error) {
    console.warn('Failed to fetch instances, this might be normal during startup:', error)
    instances.value = []
  }
}

const offline = ref<boolean>(!navigator.onLine)
window.addEventListener('offline', () => {
  offline.value = true
})
window.addEventListener('online', () => {
  offline.value = false
})

const categoryTabs = computed(() => 
  serverCategories.map(category => ({
    label: category.label,
    href: `/?category=${category.key}`
  }))
)

async function fetchServers(category: ServerCategory = 'all', reset = true, search?: string) {
  if (loading.value) return
  
  loading.value = true
  
  try {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    )
    
    const response = await Promise.race([
      getServerList({
        cursor: reset ? undefined : nextCursor.value,
        pageSize: 20,
        category,
        search: search || searchQuery.value,
        filters: filters.value,
        sortBy: sortBy.value
      }),
      timeoutPromise
    ])
    
    if (response.success) {
      if (reset) {
        servers.value = response.payload.servers
      } else {
        servers.value.push(...response.payload.servers)
      }
      hasMore.value = response.payload.hasMore
      nextCursor.value = response.payload.nextCursor
    }
  } catch (error) {
    console.warn('Failed to fetch servers:', error)
    if (reset) {
      servers.value = []
    }
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (hasMore.value && !loading.value) {
    await fetchServers(currentCategory.value, false)
  }
}

function onServerClick(server: ServerInfo) {
  router.push(`/server/${server.serverId}`)
}

function onSearchInput() {
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value)
  }
  
  searchDebounceTimer.value = setTimeout(async () => {
    await fetchServers(currentCategory.value, true)
  }, 500) as unknown as number
}

function clearSearch() {
  searchQuery.value = ''
  fetchServers(currentCategory.value, true)
}

function updateCategoryFromRoute() {
  const categoryParam = route.query.category as ServerCategory
  if (categoryParam && serverCategories.some(cat => cat.key === categoryParam)) {
    currentCategory.value = categoryParam
  } else {
    currentCategory.value = 'all'
  }
}

function onFiltersUpdate(newFilters: ServerFilterOptions | undefined) {
  filters.value = newFilters
}

function onSortByUpdate(newSortBy: ServerSortBy | undefined) {
  sortBy.value = newSortBy
}

async function applyFilters() {
  await fetchServers(currentCategory.value, true)
}

watch(() => route.query.category, async () => {
  updateCategoryFromRoute()
  await fetchServers(currentCategory.value, true)
})

let unlistenProfile: (() => void) | null = null

onMounted(async () => {
  try {
    updateCategoryFromRoute()
    
    // 异步加载数据，不阻塞页面渲染
    setTimeout(async () => {
      try {
        // 首先初始化游戏实例列表
        await fetchInstances()
        
        // 设置游戏实例变化监听器
        unlistenProfile = await profile_listener(
          async (e: { event: string; profile_path_id: string }) => {
            await fetchInstances()
          },
        )
      } catch (error) {
        console.warn('Failed to setup profile listener:', error)
      }
    }, 100)
    
    // 加载服务器列表，但不阻塞页面渲染
    fetchServers(currentCategory.value).catch(error => {
      console.warn('Failed to fetch servers on startup:', error)
    })
  } catch (error) {
    console.error('Failed to initialize main page:', error)
    handleError(error)
  }
})

onUnmounted(() => {
  if (unlistenProfile) {
    unlistenProfile()
  }
})
</script>

<template>
  <div class="p-6 flex flex-col gap-6">

    <NavTabs :links="categoryTabs" />

    <div class="flex items-center gap-4">
      <div class="relative flex-1 max-w-md">
        <input
          v-model="searchQuery"
          @input="onSearchInput"
          type="text"
          placeholder="搜索服务器..."
          class="w-full px-4 py-2 pl-10 pr-10 border border-divider rounded-lg bg-bg-raised focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary hover:text-primary"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <ServerFilter
        :filters="filters"
        :sort-by="sortBy"
        @update:filters="onFiltersUpdate"
        @update:sort-by="onSortByUpdate"
        @apply="applyFilters"
      />
    </div>

    <div v-if="offline" class="bg-orange-100 border border-orange-300 text-orange-800 px-4 py-3 rounded-lg">
      <p class="font-medium">网络离线</p>
      <p class="text-sm">请检查网络连接后重试</p>
    </div>

    <div v-else-if="loading && servers.length === 0" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
    </div>

    <div v-else-if="servers.length === 0" class="text-center py-12">
      <p class="text-secondary">暂无服务器</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <ServerCard
        v-for="server in servers"
        :key="server.serverId"
        :server="server"
        @click="onServerClick"
      />
    </div>

    <div v-if="hasMore" class="flex justify-center">
      <button
        @click="loadMore"
        :disabled="loading"
        class="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ loading ? '加载中...' : '加载更多' }}
      </button>
    </div>
  </div>
</template>
