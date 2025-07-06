pub mod mod_loader;
pub mod server_core;

use serde::{Deserialize, Serialize};

/// 此枚举用于表示 Minecraft 的游戏模式。
#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum GameMode {
    /// 生存模式
    Survival,
    /// 创造模式
    Creative,
    /// 冒险模式
    Adventure,
    /// 旁观模式
    Spectator,
}

/// 此枚举用于表示 Minecraft 的游戏难度。
#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum GameDifficulty {
    /// 和平
    Peaceful,
    /// 简单
    Easy,
    /// 普通
    Normal,
    /// 困难
    Hard,
}
