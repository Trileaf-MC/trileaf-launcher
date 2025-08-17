<template>
  <!-- 点击遮罩层（展开时显示） -->
  <div v-if="isExpanded" class="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-30 transition-opacity duration-200"
    :style="{ top: 'var(--top-bar-height, 3rem)' }" @click="toggleSidebar"></div>

  <!-- 固定在右侧的好友侧边栏 -->
  <div ref="sidebarRef" class="fixed right-0 z-[100]" :style="{
    top: 'var(--top-bar-height, 3rem)',
    height: 'calc(100vh - var(--top-bar-height, 3rem))',
    pointerEvents: 'auto'
  }">
    <!-- 默认折叠状态：显示好友头像缩略图 -->
    <div v-if="!isExpanded"
      class="w-16 h-full bg-bg-raised border-l border-divider flex flex-col items-center py-4 gap-3 overflow-y-auto cursor-pointer hover:bg-bg-raised-hover transition-colors"
      @click.stop="toggleSidebar" @mousedown.prevent @keydown.enter.prevent="toggleSidebar"
      @keydown.space.prevent="toggleSidebar" role="button" tabindex="0" title="点击展开好友列表">
      <!-- 在线好友头像 -->
      <div v-for="friend in onlineFriends.slice(0, 8)" :key="friend.id" class="relative group"
        :title="`${friend.username}${friend.status ? ' - ' + friend.status : ''} (点击展开好友列表)`"
        @click.stop="handleFriendClickInCollapsed(friend)">
        <img :src="friend.avatar" :alt="friend.username"
          class="w-10 h-10 rounded-full hover:scale-110 transition-all duration-200 border-2 border-transparent group-hover:border-brand-500 cursor-pointer"
          @error="handleImageError" />
        <!-- 在线状态指示器 -->
        <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-bg-raised rounded-full"></div>
      </div>

      <!-- 更多好友指示器 -->
      <div v-if="onlineFriends.length > 8"
        class="w-10 h-10 rounded-full bg-button-bg flex items-center justify-center text-xs font-medium hover:bg-button-bg-hover transition-colors"
        :title="`还有 ${onlineFriends.length - 8} 位好友在线 (点击展开查看全部)`">
        +{{ onlineFriends.length - 8 }}
      </div>

      <!-- 空状态提示 -->
      <div v-if="onlineFriends.length === 0" class="flex flex-col items-center justify-center flex-1 text-center px-2">
        <svg class="w-8 h-8 text-secondary mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p class="text-xs text-secondary">暂无好友在线</p>
      </div>
    </div>

    <!-- 展开状态：完整好友列表 -->
    <div v-if="isExpanded"
      class="w-80 h-full bg-bg-raised border-l border-divider flex flex-col relative transform transition-transform duration-300 ease-in-out"
      :style="{ pointerEvents: 'auto' }">
      <!-- 左边缘中间的折叠按钮 -->
      <button @click="toggleSidebar"
        class="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-lg transition-colors z-10 flex items-center justify-center"
        title="折叠好友列表">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div class="h-full flex flex-col">
        <!-- 头部 -->
        <div class="p-4 border-b border-divider bg-brand-gradient-bg">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-white">好友列表</h2>
            <div class="text-sm text-white/80">
              {{ onlineFriends.length }}/{{ allFriends.length }} 在线
            </div>
          </div>
        </div>

        <!-- 好友列表 -->
        <div class="flex-1 overflow-y-auto">
          <!-- 在线好友 -->
          <div v-if="onlineFriends.length > 0" class="p-4">
            <h3 class="text-sm font-medium text-secondary mb-3 uppercase tracking-wide">
              在线 - {{ onlineFriends.length }}
            </h3>
            <div class="space-y-2">
              <div v-for="friend in onlineFriends" :key="friend.id"
                class="flex items-center gap-3 p-2 rounded-lg hover:bg-bg-raised-hover cursor-pointer group transition-colors"
                @click="handleFriendClick(friend)">
                <div class="relative">
                  <img :src="friend.avatar" :alt="friend.username" class="w-8 h-8 rounded-full"
                    @error="handleImageError" />
                  <!-- 在线状态指示器 -->
                  <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-bg-raised rounded-full">
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-sm truncate">{{ friend.username }}</div>
                  <div v-if="friend.status" class="text-xs text-secondary truncate">{{ friend.status }}</div>
                </div>
                <!-- 悬停时显示的操作按钮 -->
                <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button class="p-1 rounded hover:bg-button-bg">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.954 8.954 0 0 1-2.72-.424l-3.457.862a.75.75 0 0 1-.909-.909l.862-3.457A8.954 8.954 0 0 1 3 12C3 7.582 6.582 4 12 4s8 3.582 8 8z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 离线好友 -->
          <div v-if="offlineFriends.length > 0" class="p-4 border-t border-divider">
            <button
              class="flex items-center justify-between w-full text-sm font-medium text-secondary mb-3 uppercase tracking-wide hover:text-primary transition-colors"
              @click="showOfflineFriends = !showOfflineFriends">
              <span>离线 - {{ offlineFriends.length }}</span>
              <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': showOfflineFriends }" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div v-show="showOfflineFriends" class="space-y-2">
              <div v-for="friend in offlineFriends" :key="friend.id"
                class="flex items-center gap-3 p-2 rounded-lg hover:bg-bg-raised-hover cursor-pointer group transition-colors opacity-60"
                @click="handleFriendClick(friend)">
                <div class="relative">
                  <img :src="friend.avatar" :alt="friend.username" class="w-8 h-8 rounded-full grayscale"
                    @error="handleImageError" />
                  <!-- 离线状态指示器 -->
                  <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-400 border-2 border-bg-raised rounded-full">
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-sm truncate">{{ friend.username }}</div>
                  <div v-if="friend.lastSeen" class="text-xs text-secondary truncate">{{ friend.lastSeen }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="allFriends.length === 0" class="p-4 text-center text-secondary">
            <div class="mb-4">
              <svg class="w-16 h-16 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
              </svg>
            </div>
            <p class="text-sm">暂无好友</p>
            <p class="text-xs mt-1">登录 Microsoft 账号后可添加好友</p>
          </div>
        </div>

        <!-- 底部操作区 -->
        <div class="p-4 border-t border-divider bg-bg-raised">
          <button
            class="w-full px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium"
            @click="handleAddFriend">
            + 添加好友
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { getAllFriends, getOnlineFriends, getOfflineFriends, type MockFriend } from '@/helpers/mockFriends'

// 定义事件
const emit = defineEmits<{
  'sidebar-toggle': [isExpanded: boolean]
}>()

// 响应式状态
const isExpanded = ref(false) // 默认折叠状态
const showOfflineFriends = ref(false)
const allFriends = ref<MockFriend[]>([])
const sidebarRef = ref<HTMLElement>()

// 计算属性
const onlineFriends = computed(() => allFriends.value.filter(friend => friend.isOnline))
const offlineFriends = computed(() => allFriends.value.filter(friend => !friend.isOnline))

// 方法
function toggleSidebar() {
  isExpanded.value = !isExpanded.value
  console.debug('[FriendsSidebar] toggle ->', isExpanded.value)
}

// 点击外部区域关闭侧边栏
function handleClickOutside(event: MouseEvent) {
  if (!isExpanded.value) return

  const target = event.target as HTMLElement
  const sidebar = sidebarRef.value

  // 检查点击是否在侧边栏内部
  if (sidebar && !sidebar.contains(target)) {
    console.debug('[FriendsSidebar] click outside detected -> collapse')
    toggleSidebar()
  }
}

// 监听侧边栏状态变化，通知父组件
watch(isExpanded, (newValue) => {
  emit('sidebar-toggle', newValue)
  console.debug('[FriendsSidebar] isExpanded changed:', newValue)

  // 当展开时，下一次tick后添加点击监听器
  if (newValue) {
    nextTick(() => {
      document.addEventListener('click', handleClickOutside)
      console.debug('[FriendsSidebar] outside-click listener attached')
    })
  } else {
    document.removeEventListener('click', handleClickOutside)
    console.debug('[FriendsSidebar] outside-click listener removed')
  }
})

function handleFriendClick(friend: MockFriend) {
  console.log('点击好友:', friend.username)
  // 这里可以添加跳转到好友详情页或发送消息等功能
}

function handleFriendClickInCollapsed(friend: MockFriend) {
  // 在折叠状态下点击好友头像时，既处理好友点击
  handleFriendClick(friend)
  if (!isExpanded.value) {
    toggleSidebar()
  }
}

function handleAddFriend() {
  console.log('添加好友')
  // 这里可以添加添加好友的逻辑
}

function handleImageError(event: Event) {
  // 头像加载失败时使用默认头像
  const target = event.target as HTMLImageElement
  target.src = 'https://mc-heads.net/avatar/steve/64'
}

// 生命周期
onMounted(() => {
  // 加载模拟好友数据
  allFriends.value = getAllFriends()
  console.debug('[FriendsSidebar] mounted, initial expanded =', isExpanded.value)
})

onUnmounted(() => {
  // 清理监听器
  document.removeEventListener('click', handleClickOutside)
})

// 暴露给父组件的方法
defineExpose({
  toggleSidebar,
  isExpanded
})
</script>

<style scoped>
/* 自定义滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: var(--color-button-bg);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: var(--color-button-bg-hover);
}

/* 确保头像悬停效果平滑 */
.group img {
  transition: all 0.2s ease-in-out;
}

/* 折叠按钮样式 */
.absolute button {
  border: 2px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  transition: all 0.2s ease-in-out;
}

.absolute button:hover {
  border-color: rgba(255, 255, 255, 0.4);
  transform: translate(-50%, -50%) scale(1.05);
}

/* 遮罩层动画 */
.fixed.bg-black {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>