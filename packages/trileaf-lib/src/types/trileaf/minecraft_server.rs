use std::net::IpAddr;

use serde::{Deserialize, Serialize};
use serde_with::{BoolFromInt, DisplayFromStr, serde_as};

use crate::types::minecraft::{GameDifficulty, GameMode, server_core};

/// 此结构体用于表示三叶互联 MC 服务器的信息。
#[serde_as]
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrileafMinecraftServerInfo {
    #[serde_as(as = "DisplayFromStr")]
    server_id: u64,
    server_name: Option<String>,
    server_ip: IpAddr,
    server_port: u16,
    icon: Option<String>,
    game_mode: Option<GameMode>,
    difficulty: Option<GameDifficulty>,
    current_players: Option<usize>,
    max_players: Option<usize>,
    motd: Option<String>,
    tags: Option<Vec<String>>,
    minecraft_version: String,
    #[serde_as(as = "BoolFromInt")]
    is_online_mode: bool,
    core_type: Option<server_core::Type>,
    core_version: String,
}
