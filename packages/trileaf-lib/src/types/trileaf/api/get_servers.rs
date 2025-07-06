use serde::{Deserialize, Serialize};
use serde_with::{DisplayFromStr, serde_as};

use crate::types::trileaf::minecraft_server::TrileafMinecraftServerInfo;

/// https://apifox.com/apidoc/shared/0590d539-cd25-46ea-b26f-96ca50ef7aad/api-310408242
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RequestQueryParams {
    pub cursor: Option<u64>,
    pub page_size: u32,
}

/// https://apifox.com/apidoc/shared/0590d539-cd25-46ea-b26f-96ca50ef7aad/api-310408242
#[serde_as]
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ResponsePayload {
    pub items: Vec<TrileafMinecraftServerInfo>,
    #[serde_as(as = "DisplayFromStr")]
    pub next_cursor: u64,
    pub has_more: bool,
}
