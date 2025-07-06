use crate::types::{
    sha::Sha512Hash, trileaf::minecraft_mod_meta::TrileafMinecraftModSource,
};

/// https://apifox.com/apidoc/shared/0590d539-cd25-46ea-b26f-96ca50ef7aad/api-310438915
pub struct RequestPathParams {
    pub server_id: u64,
}

/// https://apifox.com/apidoc/shared/0590d539-cd25-46ea-b26f-96ca50ef7aad/api-310438915
pub struct ResponsePayload {
    pub source: TrileafMinecraftModSource,
    pub content: ResponsePayloadContent,
}
/// A part of `ResponsePayload`.
pub struct ResponsePayloadContent {
    pub hash: Sha512Hash,
    pub version: String,
}
