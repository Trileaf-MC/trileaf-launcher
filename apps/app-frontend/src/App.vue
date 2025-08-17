<script setup>
import { computed, onMounted, onUnmounted, ref, watch, provide } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import {
  ArrowBigUpDashIcon,
  ChangeSkinIcon,
  CompassIcon,
  DownloadIcon,
  HomeIcon,
  LeftArrowIcon,
  LibraryIcon,
  LogInIcon,
  LogOutIcon,
  MaximizeIcon,
  MinimizeIcon,
  PlusIcon,
  RestoreIcon,
  RightArrowIcon,
  ServerIcon,
  SettingsIcon,
  WorldIcon,
  XIcon,
  NewspaperIcon,
} from '@modrinth/assets'
import {
  Avatar,
  Button,
  ButtonStyled,
  Notifications,
  OverflowMenu,
  NewsArticleCard,
} from '@modrinth/ui'
import { useLoading, useTheming } from '@/store/state'
import ModrinthAppLogo from '@/assets/modrinth_app.svg?component'
import AccountsCard from '@/components/ui/AccountsCard.vue'
import InstanceCreationModal from '@/components/ui/InstanceCreationModal.vue'
import { get } from '@/helpers/settings.ts'
import Breadcrumbs from '@/components/ui/Breadcrumbs.vue'
import RunningAppBar from '@/components/ui/RunningAppBar.vue'
import SplashScreen from '@/components/ui/SplashScreen.vue'
import ErrorModal from '@/components/ui/ErrorModal.vue'
import ModrinthLoadingIndicator from '@/components/LoadingIndicatorBar.vue'
import { handleError, useNotifications } from '@/store/notifications.js'
import { command_listener, warning_listener } from '@/helpers/events.js'
import { type } from '@tauri-apps/plugin-os'
import { getOS, isDev, restartApp } from '@/helpers/utils.js'
import { debugAnalytics, initAnalytics, optOutAnalytics, trackEvent } from '@/helpers/analytics'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { getVersion } from '@tauri-apps/api/app'
import URLConfirmModal from '@/components/ui/URLConfirmModal.vue'
import { create_profile_and_install_from_file } from './helpers/pack'
import { useError } from '@/store/error.js'
import { useCheckDisableMouseover } from '@/composables/macCssFix.js'
import ModInstallModal from '@/components/ui/install_flow/ModInstallModal.vue'
import IncompatibilityWarningModal from '@/components/ui/install_flow/IncompatibilityWarningModal.vue'
import InstallConfirmModal from '@/components/ui/install_flow/InstallConfirmModal.vue'
import { useInstall } from '@/store/install.js'
import { invoke } from '@tauri-apps/api/core'
import { get_opening_command, initialize_state } from '@/helpers/state'
import { saveWindowState, StateFlags } from '@tauri-apps/plugin-window-state'
import { renderString } from '@modrinth/utils'
import { useFetch } from '@/helpers/fetch.js'
import { check } from '@tauri-apps/plugin-updater'
import NavButton from '@/components/ui/NavButton.vue'
import { cancelLogin, get as getCreds, login, logout } from '@/helpers/mr_auth.js'
import { get_user } from '@/helpers/cache.js'
import AppSettingsModal from '@/components/ui/modal/AppSettingsModal.vue'
import AuthGrantFlowWaitModal from '@/components/ui/modal/AuthGrantFlowWaitModal.vue'
import PromotionWrapper from '@/components/ui/PromotionWrapper.vue'
import dayjs from 'dayjs'
// import PromotionWrapper from '@/components/ui/PromotionWrapper.vue'
import { hide_ads_window, init_ads_window } from '@/helpers/ads.js'
import FriendsList from '@/components/ui/friends/FriendsList.vue'
import CollapsibleFriendsSidebar from '@/components/ui/friends/CollapsibleFriendsSidebar.vue'
import { openUrl } from '@tauri-apps/plugin-opener'
import QuickInstanceSwitcher from '@/components/ui/QuickInstanceSwitcher.vue'
import { get_available_capes, get_available_skins } from './helpers/skins'
import { generateSkinPreviews } from './helpers/rendering/batch-skin-renderer'

const themeStore = useTheming()
const urlModal = ref(null)

const offline = ref(!navigator.onLine)
window.addEventListener('offline', () => {
  offline.value = true
})
window.addEventListener('online', () => {
  offline.value = false
})

const showOnboarding = ref(false)
const nativeDecorations = ref(false)

const os = ref('')

const stateInitialized = ref(false)

const criticalErrorMessage = ref()

const isMaximized = ref(false)

onMounted(async () => {
  await useCheckDisableMouseover()

  document.querySelector('body').addEventListener('click', handleClick)
  document.querySelector('body').addEventListener('auxclick', handleAuxClick)

  await invoke('show_window')

  notifications.setNotifs(notificationsWrapper.value)

  error.setErrorModal(errorModal.value)

  install.setIncompatibilityWarningModal(incompatibilityWarningModal)
  install.setInstallConfirmModal(installConfirmModal)
  install.setModInstallModal(modInstallModal)

  get_opening_command().then(handleCommand)
  checkUpdates()
  fetchCredentials()
})

onUnmounted(() => {
  document.querySelector('body').removeEventListener('click', handleClick)
  document.querySelector('body').removeEventListener('auxclick', handleAuxClick)
})

async function setupApp() {
  stateInitialized.value = true
  const {
    native_decorations,
    theme,
    telemetry,
    collapsed_navigation,
    advanced_rendering,
    onboarded,
    default_page,
    toggle_sidebar,
    developer_mode,
    feature_flags,
  } = await get()

  if (default_page === 'Library') {
    await router.push('/library')
  }

  os.value = await getOS()
  const dev = await isDev()
  const version = await getVersion()
  showOnboarding.value = !onboarded

  nativeDecorations.value = native_decorations
  if (os.value !== 'MacOS') await getCurrentWindow().setDecorations(native_decorations)

  themeStore.setThemeState(theme)
  themeStore.collapsedNavigation = collapsed_navigation
  themeStore.advancedRendering = advanced_rendering
  themeStore.toggleSidebar = toggle_sidebar
  themeStore.devMode = developer_mode
  themeStore.featureFlags = feature_flags

  isMaximized.value = await getCurrentWindow().isMaximized()

  await getCurrentWindow().onResized(async () => {
    isMaximized.value = await getCurrentWindow().isMaximized()
  })

  initAnalytics()
  if (!telemetry) {
    optOutAnalytics()
  }
  if (dev) debugAnalytics()
  trackEvent('Launched', { version, dev, onboarded })

  if (!dev) document.addEventListener('contextmenu', (event) => event.preventDefault())

  const osType = await type()
  if (osType === 'macos') {
    document.getElementsByTagName('html')[0].classList.add('mac')
  } else {
    document.getElementsByTagName('html')[0].classList.add('windows')
  }

  await warning_listener((e) =>
    notificationsWrapper.value.addNotification({
      title: 'Warning',
      text: e.message,
      type: 'warn',
    }),
  )

  useFetch(
    `https://api.modrinth.com/appCriticalAnnouncement.json?version=${version}`,
    'criticalAnnouncements',
    true,
  ).then((res) => {
    if (res && res.header && res.body) {
      criticalErrorMessage.value = res
    }
  })

  get_opening_command().then(handleCommand)
  checkUpdates()
  fetchCredentials()

  try {
    const skins = (await get_available_skins()) ?? []
    const capes = (await get_available_capes()) ?? []
    generateSkinPreviews(skins, capes)
  } catch (error) {
    console.warn('Failed to generate skin previews in app setup.', error)
  }
}

// 提前初始化全局 loading，以便启动阶段可用
const loading = useLoading()
loading.setEnabled(false)

const stateFailed = ref(false)
// 启动阶段开启全局加载，驱动开屏进度条
loading.startLoading()
initialize_state()
  .then(() => {
    setupApp()
      .then(() => {
        // 初始化完成，停止加载
        loading.stopLoading()
      })
      .catch((err) => {
        stateFailed.value = true
        console.error(err)
        error.showError(err, null, false, 'state_init')
        // 出错也停止加载，避免卡在开屏
        loading.stopLoading()
      })
  })
  .catch((err) => {
    stateFailed.value = true
    console.error('Failed to initialize app', err)
    error.showError(err, null, false, 'state_init')
    // 初始化失败时也停止加载
    loading.stopLoading()
  })

const handleClose = async () => {
  await saveWindowState(StateFlags.ALL)
  await getCurrentWindow().close()
}

const router = useRouter()
router.afterEach((to, from, failure) => {
  trackEvent('PageView', { path: to.path, fromPath: from.path, failed: failure })
})
const route = useRoute()

const notifications = useNotifications()
const notificationsWrapper = ref()

const error = useError()
const errorModal = ref()

const install = useInstall()
const modInstallModal = ref()
const installConfirmModal = ref()
const incompatibilityWarningModal = ref()

const credentials = ref()

const modrinthLoginFlowWaitModal = ref()

async function fetchCredentials() {
  const creds = await getCreds().catch(handleError)
  if (creds && creds.user_id) {
    creds.user = await get_user(creds.user_id).catch(handleError)
  }
  credentials.value = creds
}

async function signIn() {
  modrinthLoginFlowWaitModal.value.show()

  try {
    await login()
    await fetchCredentials()
  } catch (error) {
    if (
      typeof error === 'object' &&
      typeof error['message'] === 'string' &&
      error.message.includes('Login canceled')
    ) {
      // Not really an error due to being a result of user interaction, show nothing
    } else {
      handleError(error)
    }
  } finally {
    modrinthLoginFlowWaitModal.value.hide()
  }
}

async function logOut() {
  await logout().catch(handleError)
  await fetchCredentials()
}

const MIDAS_BITFLAG = 1 << 0
const hasPlus = computed(
  () =>
    credentials.value &&
    credentials.value.user &&
    (credentials.value.user.badges & MIDAS_BITFLAG) === MIDAS_BITFLAG,
)

// 侧边栏宽度管理
const sidebarWidth = ref(64) // 默认折叠状态宽度64px

function handleSidebarToggle(isExpanded) {
  sidebarWidth.value = isExpanded ? 320 : 64 // 展开320px，折叠64px
  console.debug('[App] sidebar-toggle received, isExpanded=', isExpanded, '=> sidebarWidth=', sidebarWidth.value)
}

// 在“发现模组/项目”页面隐藏好友侧边栏，只显示筛选器
const showFriendsSidebar = computed(() => {
  const path = route.path
  return !(path.startsWith('/browse') || path.startsWith('/project'))
})

// 仅在“发现模组/项目”页面渲染筛选器 Teleport 目标
const showFilterSidebarTarget = computed(() => {
  const path = route.path
  return path.startsWith('/browse') || path.startsWith('/project')
})

// 右侧需要预留的宽度（好友侧栏或筛选器）
const rightReservedWidth = computed(() => {
  if (showFriendsSidebar.value) return sidebarWidth.value
  if (showFilterSidebarTarget.value) return 320
  return 0
})

const showAd = computed(() => false)

watch(
  showAd,
  () => {
    hide_ads_window(true)
  },
  { immediate: true },
)

onMounted(() => {
  invoke('show_window')

  notifications.setNotifs(notificationsWrapper.value)

  error.setErrorModal(errorModal.value)

  install.setIncompatibilityWarningModal(incompatibilityWarningModal)
  install.setInstallConfirmModal(installConfirmModal)
  install.setModInstallModal(modInstallModal)
})

const accounts = ref(null)
provide('accountsCard', accounts)

command_listener(handleCommand)
async function handleCommand(e) {
  if (!e) return

  if (e.event === 'RunMRPack') {
    // RunMRPack should directly install a local mrpack given a path
    if (e.path.endsWith('.mrpack')) {
      await create_profile_and_install_from_file(e.path).catch(handleError)
      trackEvent('InstanceCreate', {
        source: 'CreationModalFileDrop',
      })
    }
  } else {
    // Other commands are URL-based (deep linking)
    urlModal.value.show(e)
  }
}

const updateAvailable = ref(false)
async function checkUpdates() {
  const update = await check()
  updateAvailable.value = !!update

  setTimeout(
    () => {
      checkUpdates()
    },
    5 * 1000 * 60,
  )
}

function handleClick(e) {
  let target = e.target
  while (target != null) {
    if (target.matches('a')) {
      if (
        target.href &&
        ['http://', 'https://', 'mailto:', 'tel:'].some((v) => target.href.startsWith(v)) &&
        !target.classList.contains('router-link-active') &&
        !target.href.startsWith('http://localhost') &&
        !target.href.startsWith('https://tauri.localhost') &&
        !target.href.startsWith('http://tauri.localhost')
      ) {
        openUrl(target.href)
      }
      e.preventDefault()
      break
    }
    target = target.parentElement
  }
}

function handleAuxClick(e) {
  // disables middle click -> new tab
  if (e.button === 1) {
    e.preventDefault()
    // instead do a left click
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    })
    e.target.dispatchEvent(event)
  }
}
</script>

<template>
  <SplashScreen v-if="!stateFailed" ref="splashScreen" data-tauri-drag-region />
  <div id="teleports"></div>
  <div v-if="stateInitialized" class="app-grid-layout experimental-styles-within relative">
    <Suspense>
      <AppSettingsModal ref="settingsModal" />
    </Suspense>
    <Suspense>
      <AuthGrantFlowWaitModal ref="modrinthLoginFlowWaitModal" @flow-cancel="cancelLogin" />
    </Suspense>
    <Suspense>
      <InstanceCreationModal ref="installationModal" />
    </Suspense>
    <div class="app-grid-navbar bg-bg-raised flex flex-col p-[0.5rem] pt-0 gap-[0.5rem] w-[--left-bar-width]">
      <NavButton v-tooltip.right="'Home'" to="/">
        <HomeIcon />
      </NavButton>
      <NavButton v-if="themeStore.featureFlags.worlds_tab" v-tooltip.right="'Worlds'" to="/worlds">
        <WorldIcon />
      </NavButton>
      <NavButton v-tooltip.right="'Discover content'" to="/browse/modpack"
        :is-primary="() => route.path.startsWith('/browse') && !route.query.i"
        :is-subpage="(route) => route.path.startsWith('/project') && !route.query.i">
        <CompassIcon />
      </NavButton>
      <NavButton v-tooltip.right="'Skins (Beta)'" to="/skins">
        <ChangeSkinIcon />
      </NavButton>
      <NavButton v-tooltip.right="'Library'" to="/library" :is-subpage="() =>
        route.path.startsWith('/instance') ||
        ((route.path.startsWith('/browse') || route.path.startsWith('/project')) &&
          route.query.i)
        ">
        <LibraryIcon />
      </NavButton>
      <div class="h-px w-6 mx-auto my-2 bg-button-bg"></div>
      <suspense>
        <QuickInstanceSwitcher />
      </suspense>
      <NavButton v-tooltip.right="'Create new instance'" :to="() => $refs.installationModal.show()" :disabled="offline">
        <PlusIcon />
      </NavButton>
      <div class="flex flex-grow"></div>
      <NavButton v-if="updateAvailable" v-tooltip.right="'Install update'" :to="() => restartApp()">
        <DownloadIcon />
      </NavButton>
      <NavButton v-tooltip.right="'Settings'" :to="() => $refs.settingsModal.show()">
        <SettingsIcon />
      </NavButton>
      <ButtonStyled v-if="credentials" type="transparent" circular>
        <OverflowMenu :options="[
          {
            id: 'sign-out',
            action: () => logOut(),
            color: 'danger',
          },
        ]" direction="left">
          <Avatar :src="credentials.user.avatar_url" :alt="credentials.user.username" size="32px" circle />
          <template #sign-out>
            <LogOutIcon /> Sign out
          </template>
        </OverflowMenu>
      </ButtonStyled>
      <NavButton v-else v-tooltip.right="'Sign in'" :to="() => signIn()">
        <LogInIcon />
        <template #label>Sign in</template>
      </NavButton>
    </div>
    <div data-tauri-drag-region class="app-grid-statusbar bg-bg-raised h-[--top-bar-height] flex">
      <div data-tauri-drag-region class="flex p-3">
        <ModrinthAppLogo class="h-full w-auto text-contrast pointer-events-none" />
        <div class="flex items-center gap-1 ml-3">
          <button
            class="cursor-pointer p-0 m-0 text-contrast border-none outline-none bg-button-bg rounded-full flex items-center justify-center w-6 h-6 hover:brightness-75 transition-all"
            @click="router.back()">
            <LeftArrowIcon />
          </button>
          <button
            class="cursor-pointer p-0 m-0 text-contrast border-none outline-none bg-button-bg rounded-full flex items-center justify-center w-6 h-6 hover:brightness-75 transition-all"
            @click="router.forward()">
            <RightArrowIcon />
          </button>
        </div>
        <Breadcrumbs class="pt-[2px]" />
      </div>
      <section class="flex ml-auto items-center">
        <div class="flex mr-3">
          <Suspense>
            <RunningAppBar />
          </Suspense>
        </div>
        <section v-if="!nativeDecorations" class="window-controls" data-tauri-drag-region-exclude>
          <Button class="titlebar-button" icon-only @click="() => getCurrentWindow().minimize()">
            <MinimizeIcon />
          </Button>
          <Button class="titlebar-button" icon-only @click="() => getCurrentWindow().toggleMaximize()">
            <RestoreIcon v-if="isMaximized" />
            <MaximizeIcon v-else />
          </Button>
          <Button class="titlebar-button close" icon-only @click="handleClose">
            <XIcon />
          </Button>
        </section>
      </section>
    </div>
  </div>
  <div v-if="stateInitialized" class="app-contents experimental-styles-within" :style="{
    'padding-right': rightReservedWidth + 'px',
    '--sidebar-width': sidebarWidth + 'px'
  }">
    <div class="app-viewport flex-grow router-view">
      <div class="loading-indicator-container h-8 fixed z-50" :style="{
        top: 'calc(var(--top-bar-height))',
        left: 'calc(var(--left-bar-width))',
        width: `calc(100% - var(--left-bar-width) - ${rightReservedWidth}px)`,
      }">
        <ModrinthLoadingIndicator />
      </div>
      <div v-if="themeStore.featureFlags.page_path"
        class="absolute bottom-0 left-0 m-2 bg-tooltip-bg text-tooltip-text font-semibold rounded-full px-2 py-1 text-xs z-50">
        {{ route.fullPath }}
      </div>
      <div id="background-teleport-target" class="absolute h-full -z-10 rounded-tl-[--radius-xl] overflow-hidden"
        :style="{ width: `calc(100% - ${rightReservedWidth}px)` }"></div>
      <div v-if="showFilterSidebarTarget" id="sidebar-teleport-target"
        class="absolute top-0 bottom-0 right-0 z-40 overflow-auto bg-bg-raised/90 backdrop-blur-sm border-l border-divider"
        :style="{ right: (showFriendsSidebar ? `${sidebarWidth}px` : '0px'), width: '320px' }"></div>
      <div v-if="criticalErrorMessage"
        class="m-6 mb-0 flex flex-col border-red bg-bg-red rounded-2xl border-2 border-solid p-4 gap-1 font-semibold text-contrast">
        <h1 class="m-0 text-lg font-extrabold">{{ criticalErrorMessage.header }}</h1>
        <div class="markdown-body text-primary" v-html="renderString(criticalErrorMessage.body ?? '')"></div>
      </div>
      <RouterView v-slot="{ Component }">
        <template v-if="Component">
          <Suspense @pending="loading.startLoading()" @resolve="loading.stopLoading()">
            <component :is="Component"></component>
          </Suspense>
        </template>
      </RouterView>
    </div>

    <!-- 可折叠的好友侧边栏（在发现模组/项目页隐藏） -->
    <CollapsibleFriendsSidebar v-if="showFriendsSidebar" ref="friendsSidebar" @sidebar-toggle="handleSidebarToggle" />
  </div>
  <URLConfirmModal ref="urlModal" />
  <Notifications ref="notificationsWrapper" sidebar />
  <ErrorModal ref="errorModal" />
  <ModInstallModal ref="modInstallModal" />
  <IncompatibilityWarningModal ref="incompatibilityWarningModal" />
  <InstallConfirmModal ref="installConfirmModal" />
</template>

<style lang="scss" scoped>
.window-controls {
  z-index: 20;
  display: none;
  flex-direction: row;
  align-items: center;

  .titlebar-button {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all ease-in-out 0.1s;
    background-color: transparent;
    color: var(--color-base);
    height: 100%;
    width: 3rem;
    position: relative;
    box-shadow: none;

    &:last-child {
      padding-right: 0.75rem;
      width: 3.75rem;
    }

    svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    &::before {
      content: '';
      border-radius: 999999px;
      width: 3rem;
      height: 3rem;
      aspect-ratio: 1 / 1;
      margin-block: auto;
      position: absolute;
      background-color: transparent;
      scale: 0.9;
      transition: all ease-in-out 0.2s;
      z-index: -1;
    }

    &.close {

      &:hover,
      &:active {
        color: var(--color-accent-contrast);

        &::before {
          background-color: var(--color-red);
        }
      }
    }

    &:hover,
    &:active {
      color: var(--color-contrast);

      &::before {
        background-color: var(--color-button-bg);
        scale: 1;
      }
    }
  }
}

.app-grid-layout,
.app-contents {
  --top-bar-height: 3rem;
  --left-bar-width: 4rem;
}

.app-grid-layout {
  display: grid;
  grid-template: 'status status' 'nav dummy';
  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr;
  position: relative;
  //z-index: 0;
  background-color: var(--color-raised-bg);
  height: 100vh;
}

.app-grid-navbar {
  grid-area: nav;
  z-index: 50;
  position: relative;
}

.app-grid-statusbar {
  grid-area: status;
  z-index: 50;
  position: relative;
}

[data-tauri-drag-region] {
  -webkit-app-region: drag;
}

[data-tauri-drag-region-exclude] {
  -webkit-app-region: no-drag;
}

.app-contents {
  position: absolute;
  z-index: 1;
  left: var(--left-bar-width);
  top: var(--top-bar-height);
  right: 0;
  bottom: 0;
  height: calc(100vh - var(--top-bar-height));
  background-color: var(--color-bg);
  border-top-left-radius: var(--radius-xl);
}

.loading-indicator-container {
  border-top-left-radius: var(--radius-xl);
  overflow: hidden;
}

/* 移除原侧边栏样式，使用新的可折叠好友侧边栏 */

.app-viewport {
  flex-grow: 1;
  height: 100%;
  overflow: auto;
  overflow-x: hidden;
}

.app-contents::before {
  z-index: 1;
  content: '';
  position: fixed;
  left: var(--left-bar-width);
  top: var(--top-bar-height);
  right: var(--sidebar-width, 64px);
  bottom: calc(-1 * var(--left-bar-width));
  border-radius: var(--radius-xl);
  box-shadow:
    1px 1px 15px rgba(0, 0, 0, 0.2) inset,
    inset 1px 1px 1px rgba(255, 255, 255, 0.23);
  pointer-events: none;
}
</style>
<style>
.mac {
  .app-grid-statusbar {
    padding-left: 5rem;
  }
}

.windows {
  .fake-appbar {
    height: 2.5rem !important;
  }

  .window-controls {
    display: flex !important;
  }

  .info-card {
    right: 8rem;
  }

  .profile-card {
    right: 8rem;
  }
}
</style>
<style src="vue-multiselect/dist/vue-multiselect.css"></style>
