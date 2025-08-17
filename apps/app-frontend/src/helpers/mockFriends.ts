// 好友模拟数据 - 用于测试功能
export interface MockFriend {
  id: string
  username: string
  avatar: string
  isOnline: boolean
  status?: string
  lastSeen?: string
}

export const mockFriends: MockFriend[] = [
  {
    id: 'friend_1',
    username: 'Steve_Builder',
    avatar: 'https://mc-heads.net/avatar/steve/64',
    isOnline: true,
    status: '在三叶生存服建造中...'
  },
  {
    id: 'friend_2', 
    username: 'Alex_Miner',
    avatar: 'https://mc-heads.net/avatar/alex/64',
    isOnline: true,
    status: '挖矿中'
  },
  {
    id: 'friend_3',
    username: 'Creeper_King',
    avatar: 'https://mc-heads.net/avatar/creeper/64',
    isOnline: false,
    lastSeen: '2小时前'
  },
  {
    id: 'friend_4',
    username: 'Redstone_Master',
    avatar: 'https://mc-heads.net/avatar/redstone/64',
    isOnline: true,
    status: '红石科技服'
  },
  {
    id: 'friend_5',
    username: 'Ender_Dragon',
    avatar: 'https://mc-heads.net/avatar/enderdragon/64',
    isOnline: false,
    lastSeen: '昨天'
  },
  {
    id: 'friend_6',
    username: 'Diamond_Hunter',
    avatar: 'https://mc-heads.net/avatar/diamond/64',
    isOnline: true,
    status: '寻找钻石中...'
  },
  {
    id: 'friend_7',
    username: 'Villager_Trader',
    avatar: 'https://mc-heads.net/avatar/villager/64',
    isOnline: false,
    lastSeen: '5分钟前'
  },
  {
    id: 'friend_8',
    username: 'Nether_Explorer',
    avatar: 'https://mc-heads.net/avatar/nether/64',
    isOnline: true,
    status: '下界探险中'
  }
]

// 获取在线好友列表
export function getOnlineFriends(): MockFriend[] {
  return mockFriends.filter(friend => friend.isOnline)
}

// 获取离线好友列表
export function getOfflineFriends(): MockFriend[] {
  return mockFriends.filter(friend => !friend.isOnline)
}

// 获取所有好友列表
export function getAllFriends(): MockFriend[] {
  return [...mockFriends]
}