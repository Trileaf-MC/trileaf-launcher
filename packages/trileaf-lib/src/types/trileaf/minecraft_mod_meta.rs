use crate::{types::sha::Sha512Hash, utils};
use serde::{Deserialize, Serialize};

use super::api::get_server_mods_meta::ResponsePayload as ApiResponsePayload;

/// 此枚举用于表示三叶互联 MC 模组的获取来源。
/// `Local` 表示模组存于三叶互联服务端。
#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub enum TrileafMinecraftModSource {
    Modrinth,
    Curseforge,
    Local,
}

/// 此枚举用于表示三叶互联 MC 模组的元数据。
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TrileafMinecraftModMeta {
    pub source: TrileafMinecraftModSource,
    #[serde(with = "utils::serde::serde_sha512_as_hex")]
    pub hash: Sha512Hash,
    pub version: String,
}

impl From<ApiResponsePayload> for TrileafMinecraftModMeta {
    fn from(value: ApiResponsePayload) -> Self {
        Self {
            source: value.source,
            hash: value.content.hash,
            version: value.content.version,
        }
    }
}
