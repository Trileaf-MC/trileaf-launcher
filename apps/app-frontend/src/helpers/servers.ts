import type { ServerListResponse, ServerInfo, ServerCategory, ServerFilterOptions, ServerSortBy } from './types'
import { invoke } from '@tauri-apps/api/core'

const TRILEAF_API_BASE = 'https://liebepj.cn/prod-api'

// 模拟数据 - 用于测试
const mockServers: ServerInfo[] = [
  {
    serverId: '1',
    serverName: '三叶生存服',
    serverIp: 'survival.sanyeyun.cn',
    serverPort: 25565,
    gameMode: '生存',
    difficulty: '困难',
    currentPlayers: 156,
    maxPlayers: 200,
    minecraftVersion: '1.20.1',
    isOnlineMode: true,
    category: 'survival',
    description: '经典生存体验，拥有完善的经济系统和领地保护',
    ping: 45,
    dailyActiveUsers: 320,
    averageTps: 19.8,
    peakPlayers: 189,
    uptime: 99.2
  },
  {
    serverId: '2',
    serverName: '创造建筑服',
    serverIp: 'creative.sanyeyun.cn',
    serverPort: 25566,
    gameMode: '创造',
    difficulty: '和平',
    currentPlayers: 89,
    maxPlayers: 100,
    minecraftVersion: '1.20.1',
    isOnlineMode: true,
    category: 'creative',
    description: '自由建筑，展示你的创意和想象力',
    ping: 32,
    dailyActiveUsers: 145,
    averageTps: 19.9,
    peakPlayers: 96,
    uptime: 98.7
  },
  {
    serverId: '3',
    serverName: '机械动力整合包服',
    serverIp: 'modded.sanyeyun.cn',
    serverPort: 25567,
    gameMode: '生存',
    difficulty: '普通',
    currentPlayers: 67,
    maxPlayers: 80,
    minecraftVersion: '1.20.1',
    isOnlineMode: true,
    category: 'modded',
    description: '以Create模组为核心的科技整合包，体验工业自动化的乐趣',
    ping: 28,
    dailyActiveUsers: 89,
    averageTps: 18.5,
    peakPlayers: 76,
    uptime: 97.3
  },
  {
    serverId: '4',
    serverName: 'PVP竞技场',
    serverIp: 'pvp.sanyeyun.cn',
    serverPort: 25568,
    gameMode: '冒险',
    difficulty: '困难',
    currentPlayers: 45,
    maxPlayers: 60,
    minecraftVersion: '1.20.1',
    isOnlineMode: true,
    category: 'pvp',
    description: '激烈的PVP对战，测试你的战斗技巧',
    ping: 18,
    dailyActiveUsers: 156,
    averageTps: 19.5,
    peakPlayers: 58,
    uptime: 96.8
  },
  {
    serverId: '5',
    serverName: '小游戏大厅',
    serverIp: 'minigames.sanyeyun.cn',
    serverPort: 25569,
    gameMode: '冒险',
    difficulty: '简单',
    currentPlayers: 234,
    maxPlayers: 300,
    minecraftVersion: '1.20.1',
    isOnlineMode: true,
    category: 'mini-games',
    description: '丰富的小游戏模式：起床战争、空岛战争、躲猫猫等',
    ping: 52,
    dailyActiveUsers: 567,
    averageTps: 19.2,
    peakPlayers: 287,
    uptime: 99.5
  },
  {
    serverId: '6',
    serverName: '新手友好服',
    serverIp: 'newbie.sanyeyun.cn',
    serverPort: 25570,
    gameMode: '生存',
    difficulty: '简单',
    currentPlayers: 78,
    maxPlayers: 120,
    minecraftVersion: '1.20.1',
    isOnlineMode: false,
    category: 'survival',
    description: '专为新手打造的友好环境，有详细的新手教程',
    ping: 38,
    dailyActiveUsers: 234,
    averageTps: 19.7,
    peakPlayers: 112,
    uptime: 98.9
  },
  {
    serverId: '7',
    serverName: '神奇宝贝服',
    serverIp: 'pixelmon.sanyeyun.cn',
    serverPort: 25571,
    gameMode: '冒险',
    difficulty: '普通',
    currentPlayers: 145,
    maxPlayers: 200,
    minecraftVersion: '1.16.5',
    isOnlineMode: true,
    category: 'modded',
    description: '神奇宝贝模组服务器，收集、训练你的宝可梦',
    ping: 67,
    dailyActiveUsers: 278,
    averageTps: 17.8,
    peakPlayers: 189,
    uptime: 95.4
  },
  {
    serverId: '8',
    serverName: '空岛生存',
    serverIp: 'skyblock.sanyeyun.cn',
    serverPort: 25572,
    gameMode: '生存',
    difficulty: '困难',
    currentPlayers: 92,
    maxPlayers: 150,
    minecraftVersion: '1.20.1',
    isOnlineMode: true,
    category: 'survival',
    description: '经典空岛生存模式，挑战你的生存技能',
    ping: 41,
    dailyActiveUsers: 167,
    averageTps: 19.1,
    peakPlayers: 134,
    uptime: 98.1
  },
  {
    serverId: '9',
    serverName: '建筑比赛服',
    serverIp: 'build.sanyeyun.cn',
    serverPort: 25573,
    gameMode: '创造',
    difficulty: '和平',
    currentPlayers: 23,
    maxPlayers: 50,
    minecraftVersion: '1.20.1',
    isOnlineMode: true,
    category: 'creative',
    description: '定期举办建筑比赛，展示你的建筑才华',
    ping: 29,
    dailyActiveUsers: 45,
    averageTps: 19.9,
    peakPlayers: 47,
    uptime: 97.8
  },
  {
    serverId: '10',
    serverName: '怪物猎人服',
    serverIp: 'hunter.sanyeyun.cn',
    serverPort: 25574,
    gameMode: '生存',
    difficulty: '困难',
    currentPlayers: 87,
    maxPlayers: 100,
    minecraftVersion: '1.19.4',
    isOnlineMode: true,
    category: 'modded',
    description: '怪物猎人主题模组服，狩猎各种强大的怪物',
    ping: 156,
    dailyActiveUsers: 123,
    averageTps: 16.9,
    peakPlayers: 98,
    uptime: 94.2
  },
  {
    serverId: '11',
    serverName: '红石科技服',
    serverIp: 'redstone.sanyeyun.cn',
    serverPort: 25575,
    gameMode: '创造',
    difficulty: '和平',
    currentPlayers: 34,
    maxPlayers: 80,
    minecraftVersion: '1.20.1',
    isOnlineMode: true,
    category: 'creative',
    description: '专注于红石电路设计和自动化装置',
    ping: 22,
    dailyActiveUsers: 67,
    averageTps: 19.8,
    peakPlayers: 72,
    uptime: 99.1
  },
  {
    serverId: '12',
    serverName: '魔法世界',
    serverIp: 'magic.sanyeyun.cn',
    serverPort: 25576,
    gameMode: '生存',
    difficulty: '普通',
    currentPlayers: 178,
    maxPlayers: 200,
    minecraftVersion: '1.18.2',
    isOnlineMode: true,
    category: 'modded',
    description: '魔法主题整合包，学习各种魔法和法术',
    ping: 73,
    dailyActiveUsers: 289,
    averageTps: 18.2,
    peakPlayers: 196,
    uptime: 96.7
  }
]

export async function getServerList(params: {
  cursor?: string
  pageSize?: number
  category?: ServerCategory
  search?: string
  filters?: ServerFilterOptions
  sortBy?: ServerSortBy
}): Promise<ServerListResponse> {
  const { cursor, pageSize = 20, category, search, filters, sortBy } = params
  
  // 使用模拟数据进行开发测试
  await new Promise(resolve => setTimeout(resolve, 300)) // 模拟网络延迟
  
  let filteredServers = [...mockServers]
  
  // 按分类筛选
  if (category && category !== 'all') {
    filteredServers = filteredServers.filter(server => server.category === category)
  }
  
  // 按搜索词筛选
  if (search && search.trim()) {
    const searchTerm = search.trim().toLowerCase()
    filteredServers = filteredServers.filter(server =>
      server.serverName.toLowerCase().includes(searchTerm) ||
      server.description?.toLowerCase().includes(searchTerm) ||
      server.serverIp.toLowerCase().includes(searchTerm)
    )
  }
  
  // 应用高级筛选
  if (filters) {
    filteredServers = filteredServers.filter(server => {
      if (filters.minPlayers !== undefined && server.currentPlayers < filters.minPlayers) return false
      if (filters.maxPlayers !== undefined && server.currentPlayers > filters.maxPlayers) return false
      if (filters.minDailyActive !== undefined && (server.dailyActiveUsers || 0) < filters.minDailyActive) return false
      if (filters.minTps !== undefined && (server.averageTps || 0) < filters.minTps) return false
      if (filters.maxPing !== undefined && (server.ping || 999) > filters.maxPing) return false
      if (filters.minUptime !== undefined && (server.uptime || 0) < filters.minUptime) return false
      if (filters.onlineMode !== undefined && server.isOnlineMode !== filters.onlineMode) return false
      return true
    })
  }
  
  // 应用排序
  if (sortBy) {
    filteredServers.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return (b.dailyActiveUsers || 0) - (a.dailyActiveUsers || 0)
        case 'players':
          return b.currentPlayers - a.currentPlayers
        case 'ping':
          return (a.ping || 999) - (b.ping || 999)
        case 'tps':
          return (b.averageTps || 0) - (a.averageTps || 0)
        case 'uptime':
          return (b.uptime || 0) - (a.uptime || 0)
        case 'daily_active':
          return (b.dailyActiveUsers || 0) - (a.dailyActiveUsers || 0)
        default:
          return 0
      }
    })
  }
  
  // 模拟分页
  const startIndex = cursor ? parseInt(cursor) : 0
  const endIndex = startIndex + pageSize
  const paginatedServers = filteredServers.slice(startIndex, endIndex)
  const hasMore = endIndex < filteredServers.length
  
  return {
    success: true,
    code: 200,
    payload: {
      servers: paginatedServers,
      nextCursor: hasMore ? endIndex.toString() : undefined,
      hasMore
    }
  }
  
  // 生产环境中使用真实API
  /*
  const url = new URL(`${TRILEAF_API_BASE}/initiator/get-servers`)
  
  if (cursor) {
    url.searchParams.set('cursor', cursor)
  }
  url.searchParams.set('pageSize', pageSize.toString())
  
  if (category && category !== 'all') {
    url.searchParams.set('category', category)
  }
  
  if (search && search.trim()) {
    url.searchParams.set('search', search.trim())
  }

  try {
    const response = await fetch(url.toString())
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch server list:', error)
    return {
      success: false,
      code: -1,
      payload: {
        servers: [],
        hasMore: false
      }
    }
  }
  */
}

export async function getServerDetails(serverId: string): Promise<ServerInfo | null> {
  // 使用模拟数据进行开发测试
  await new Promise(resolve => setTimeout(resolve, 300)) // 模拟网络延迟
  
  const server = mockServers.find(s => s.serverId === serverId)
  return server || null
  
  // 生产环境中使用真实API
  /*
  try {
    const response = await fetch(`${TRILEAF_API_BASE}/initiator/get-server-details/${serverId}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data.payload
  } catch (error) {
    console.error('Failed to fetch server details:', error)
    return null
  }
  */
}

export async function pingServer(serverIp: string, serverPort: number): Promise<number | null> {
  try {
    const start = Date.now()
    const response = await fetch(`${TRILEAF_API_BASE}/initiator/ping-server`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ serverIp, serverPort })
    })
    
    if (!response.ok) {
      return null
    }
    
    return Date.now() - start
  } catch (error) {
    console.error('Failed to ping server:', error)
    return null
  }
}

export const serverCategories: { key: ServerCategory; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'survival', label: '生存' },
  { key: 'creative', label: '创造' },
  { key: 'modded', label: '模组' },
  { key: 'mini-games', label: '小游戏' },
  { key: 'pvp', label: 'PVP' }
]