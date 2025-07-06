use trileaf_lib::types::trileaf::api::{
    ApiResponse, get_server_mods_meta::ResponsePayload,
};

use crate::api::API_BASE_URL;

#[tokio::test]
async fn test_get_server_mods_meta() {
    let _resp = reqwest::get(format!(
        "{}{}",
        API_BASE_URL, "/initiator/get-server-mods-meta/1935254584806653953"
    ))
    .await
    .unwrap()
    .json::<ApiResponse<ResponsePayload>>()
    .await
    .unwrap();
}
