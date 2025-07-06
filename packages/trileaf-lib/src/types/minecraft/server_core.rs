use serde::{Deserialize, Serialize};

/// 此枚举用于表示 Minecraft 服务器核心的类型。
#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Type {
    Paper,
}
