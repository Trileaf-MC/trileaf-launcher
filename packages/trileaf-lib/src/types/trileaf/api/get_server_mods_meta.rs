use crate::utils;
use serde::{Deserialize, Serialize};

use crate::types::{
    sha::Sha512Hash, trileaf::minecraft_mod_meta::TrileafMinecraftModSource,
};

/// https://apifox.com/apidoc/shared/0590d539-cd25-46ea-b26f-96ca50ef7aad/api-310438915
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RequestPathParams {
    pub server_id: u64,
}

/// https://apifox.com/apidoc/shared/0590d539-cd25-46ea-b26f-96ca50ef7aad/api-310438915
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ResponsePayload {
    pub source: TrileafMinecraftModSource,
    pub content: ResponsePayloadContent,
}
/// A part of `ResponsePayload`.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ResponsePayloadContent {
    #[serde(with = "utils::serde::serde_sha512_as_hex")]
    pub hash: Sha512Hash,
    pub version: String,
}
