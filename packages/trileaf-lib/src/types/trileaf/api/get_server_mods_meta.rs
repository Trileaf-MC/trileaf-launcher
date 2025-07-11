use crate::{types::sha::Sha512OrSha1Hash, utils};
use serde::{Deserialize, Serialize};

use crate::types::trileaf::minecraft_mod_meta::TrileafMinecraftModSource;

/// https://apifox.com/apidoc/shared/0590d539-cd25-46ea-b26f-96ca50ef7aad/api-310438915
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RequestPathParams {
    pub server_id: u64,
}

/// https://apifox.com/apidoc/shared/0590d539-cd25-46ea-b26f-96ca50ef7aad/api-310438915
pub type ResponsePayload = Vec<ResponsePayloadItem>;
/// A item of `ResponsePayload`.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ResponsePayloadItem {
    pub source: TrileafMinecraftModSource,
    pub content: ResponsePayloadContent,
}
/// A part of `ResponsePayloadItem`.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ResponsePayloadContent {
    #[serde(with = "utils::serde::serde_sha512_or_sha1_as_hex")]
    pub hash: Sha512OrSha1Hash,
    pub version: String,
}
