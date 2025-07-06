use crate::{types::sha::Sha512OrSha1Hash, utils};
use serde::{Deserialize, Serialize};

use super::api::get_server_mods_meta::ResponsePayloadItem as ApiResponsePayloadItem;

/// 此枚举用于表示三叶互联 MC 模组的获取来源。
/// `Local` 表示模组存于三叶互联服务端。
#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum TrileafMinecraftModSource {
    Modrinth,
    Curseforge,
    Local,
}

/// 此枚举用于表示三叶互联 MC 模组的元数据。
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TrileafMinecraftModMeta {
    pub source: TrileafMinecraftModSource,
    #[serde(with = "utils::serde::serde_sha512_or_sha1_as_hex")]
    pub hash: Sha512OrSha1Hash,
    pub version: String,
}

impl From<ApiResponsePayloadItem> for TrileafMinecraftModMeta {
    fn from(value: ApiResponsePayloadItem) -> Self {
        Self {
            source: value.source,
            hash: value.content.hash,
            version: value.content.version,
        }
    }
}
