use serde::{Deserialize, Serialize};

/// 此枚举用于表示 Minecraft 模组加载器的类型。
#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Type {
    Fabric,
    Forge,
}
