import type { ServerInfo } from './types'
import { create, get } from './profile'
import { add_server_to_profile, start_join_server } from './worlds'
import { login as login_flow } from './auth'

type Loader = 'vanilla' | 'fabric' | 'forge' | 'quilt' | 'neoforge'

// 测试用：为部分服务器硬编码一个示例整合包（请替换为真实的 Modrinth 项目/版本 ID）
const testServerModpackMap: Record<
  string,
  { projectId: string; versionId: string; loader: Loader }
> = {
  // 机械动力整合包服 -> 示例占位 ID（需要替换成真实）
  '3': { projectId: 'TEST_PROJECT_ID', versionId: 'TEST_VERSION_ID', loader: 'fabric' },
}

function getRecommendedLoader(server: ServerInfo): Loader {
  if (server.category === 'modded') return 'fabric'
  return 'vanilla'
}

function getDeterministicProfileId(server: ServerInfo): string {
  return `autojoin-${server.serverId}`
}

function buildServerAddress(server: ServerInfo): string {
  const port = server.serverPort ?? 25565
  return `${server.serverIp}:${port}`
}

async function ensureInstance(server: ServerInfo): Promise<string> {
  const profileId = getDeterministicProfileId(server)
  const existing = await get(profileId)
  if (existing) return profileId

  const loader = getRecommendedLoader(server)
  const loaderVersion = loader === 'vanilla' ? null : 'stable'

  // 创建实例（跳过立即安装，由 finish_install 统一收尾）
  await create(profileId, server.minecraftVersion, loader, loaderVersion, null, true)

  // 如果该服务器有预设的整合包映射，演示如何复用内置打包安装能力
  const modpack = testServerModpackMap[server.serverId]
  if (modpack) {
    try {
      const { install_to_existing_profile } = await import('./pack')
      await install_to_existing_profile(
        modpack.projectId,
        modpack.versionId,
        server.serverName,
        profileId,
      )
    } catch (e) {
      console.warn('安装示例整合包失败，继续使用空实例：', e)
    }
  }

  return profileId
}

async function ensureServerListed(profileId: string, server: ServerInfo) {
  const address = buildServerAddress(server)
  try {
    await add_server_to_profile(profileId, server.serverName, address, 'prompt')
  } catch (e) {
    console.warn('写入服务器列表失败，忽略（QuickPlay 仍可生效）：', e)
  }
}

export async function joinServerOneClick(server: ServerInfo): Promise<void> {
  const profileId = await ensureInstance(server)
  await ensureServerListed(profileId, server)

  const address = buildServerAddress(server)
  try {
    await start_join_server(profileId, address)
  } catch (err: any) {
    const message = String(err?.message || err)
    if (
      message.includes('NoCredentialsError') ||
      message.includes('no credentials') ||
      message.includes('not logged in')
    ) {
      const loggedIn = await login_flow().catch(() => null)
      if (loggedIn) {
        await start_join_server(profileId, address)
        return
      }
      throw new Error('需要登录以加入服务器')
    }
    throw err
  }
}
