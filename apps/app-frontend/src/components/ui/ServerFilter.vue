<template>
  <div class="relative">
    <!-- 筛选按钮 -->
    <button
      @click="toggleFilter"
      class="px-4 py-2 border border-divider rounded-lg bg-bg-raised hover:bg-bg-raised-hover focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 flex items-center gap-2"
    >
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
      </svg>
      <span>筛选</span>
      <div v-if="hasActiveFilters" class="w-2 h-2 bg-brand-500 rounded-full"></div>
    </button>

    <!-- 筛选面板 -->
    <div
      v-if="showFilter"
      class="absolute top-12 right-0 z-50 w-80 bg-bg-raised border border-divider rounded-lg shadow-lg p-4"
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-lg">高级筛选</h3>
        <button
          @click="resetFilters"
          class="text-sm text-secondary hover:text-primary"
        >
          重置
        </button>
      </div>

      <div class="space-y-4">
        <!-- 在线人数筛选 -->
        <div>
          <label class="block text-sm font-medium mb-2">在线人数</label>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <input
                v-model.number="localFilters.minPlayers"
                type="number"
                min="0"
                placeholder="最少"
                class="w-full px-3 py-2 text-sm border border-divider rounded bg-bg focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <input
                v-model.number="localFilters.maxPlayers"
                type="number"
                min="0"
                placeholder="最多"
                class="w-full px-3 py-2 text-sm border border-divider rounded bg-bg focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        <!-- 日活用户筛选 -->
        <div>
          <label class="block text-sm font-medium mb-2">日活用户</label>
          <input
            v-model.number="localFilters.minDailyActive"
            type="number"
            min="0"
            placeholder="最少日活用户数"
            class="w-full px-3 py-2 text-sm border border-divider rounded bg-bg focus:outline-none focus:border-brand-500"
          />
        </div>

        <!-- TPS筛选 -->
        <div>
          <label class="block text-sm font-medium mb-2">服务器TPS</label>
          <input
            v-model.number="localFilters.minTps"
            type="number"
            min="0"
            max="20"
            step="0.1"
            placeholder="最低TPS (建议 ≥ 18)"
            class="w-full px-3 py-2 text-sm border border-divider rounded bg-bg focus:outline-none focus:border-brand-500"
          />
        </div>

        <!-- 延迟筛选 -->
        <div>
          <label class="block text-sm font-medium mb-2">网络延迟</label>
          <input
            v-model.number="localFilters.maxPing"
            type="number"
            min="0"
            placeholder="最大延迟 (ms)"
            class="w-full px-3 py-2 text-sm border border-divider rounded bg-bg focus:outline-none focus:border-brand-500"
          />
        </div>

        <!-- 运行时间筛选 -->
        <div>
          <label class="block text-sm font-medium mb-2">运行时间稳定性</label>
          <input
            v-model.number="localFilters.minUptime"
            type="number"
            min="0"
            max="100"
            step="0.1"
            placeholder="最低运行时间 (%)"
            class="w-full px-3 py-2 text-sm border border-divider rounded bg-bg focus:outline-none focus:border-brand-500"
          />
        </div>

        <!-- 正版验证筛选 -->
        <div>
          <label class="block text-sm font-medium mb-2">正版验证</label>
          <select
            v-model="localFilters.onlineMode"
            class="w-full px-3 py-2 text-sm border border-divider rounded bg-bg focus:outline-none focus:border-brand-500"
          >
            <option :value="undefined">不限制</option>
            <option :value="true">仅正版</option>
            <option :value="false">仅盗版</option>
          </select>
        </div>

        <!-- 排序选项 -->
        <div>
          <label class="block text-sm font-medium mb-2">排序方式</label>
          <select
            v-model="localSortBy"
            class="w-full px-3 py-2 text-sm border border-divider rounded bg-bg focus:outline-none focus:border-brand-500"
          >
            <option value="">默认排序</option>
            <option value="popularity">人气排序</option>
            <option value="players">在线人数</option>
            <option value="ping">网络延迟</option>
            <option value="tps">服务器性能</option>
            <option value="uptime">稳定性</option>
            <option value="daily_active">日活用户</option>
          </select>
        </div>
      </div>

      <div class="flex gap-2 mt-6">
        <button
          @click="applyFilters"
          class="flex-1 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 font-medium"
        >
          应用筛选
        </button>
        <button
          @click="toggleFilter"
          class="px-4 py-2 border border-divider rounded-lg hover:bg-bg-raised-hover"
        >
          取消
        </button>
      </div>
    </div>

    <!-- 点击外部关闭筛选面板 -->
    <div
      v-if="showFilter"
      @click="toggleFilter"
      class="fixed inset-0 z-40"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ServerFilterOptions, ServerSortBy } from '@/helpers/types'

interface Props {
  filters?: ServerFilterOptions
  sortBy?: ServerSortBy
}

interface Emits {
  (e: 'update:filters', filters: ServerFilterOptions | undefined): void
  (e: 'update:sortBy', sortBy: ServerSortBy | undefined): void
  (e: 'apply'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showFilter = ref(false)
const localFilters = ref<ServerFilterOptions>({ ...props.filters })
const localSortBy = ref<ServerSortBy | undefined>(props.sortBy)

const hasActiveFilters = computed(() => {
  if (!localFilters.value) return false
  return Object.values(localFilters.value).some(value => value !== undefined && value !== '')
})

function toggleFilter() {
  showFilter.value = !showFilter.value
}

function resetFilters() {
  localFilters.value = {}
  localSortBy.value = undefined
  applyFilters()
}

function applyFilters() {
  // 清理空值
  const cleanedFilters: ServerFilterOptions = {}
  Object.entries(localFilters.value).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) {
      cleanedFilters[key as keyof ServerFilterOptions] = value
    }
  })
  
  emit('update:filters', Object.keys(cleanedFilters).length > 0 ? cleanedFilters : undefined)
  emit('update:sortBy', localSortBy.value || undefined)
  emit('apply')
  showFilter.value = false
}

// 监听props变化
watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { immediate: true, deep: true })

watch(() => props.sortBy, (newSortBy) => {
  localSortBy.value = newSortBy
}, { immediate: true })
</script>

<style scoped>
/* 确保下拉框在暗色模式下也能正常显示 */
select option {
  background-color: var(--color-bg-raised);
  color: var(--color-text-primary);
}
</style>