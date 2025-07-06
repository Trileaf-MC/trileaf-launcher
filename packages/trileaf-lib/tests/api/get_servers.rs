use trileaf_lib::types::trileaf::api::{
    ApiResponse,
    get_servers::{RequestQueryParams, ResponsePayload},
};

use crate::api::API_BASE_URL;

#[tokio::test]
async fn test_get_server_mods_meta() {
    let query_params = RequestQueryParams {
        cursor: None,
        page_size: 2,
    };

    #[allow(clippy::format_in_format_args)]
    let _resp = reqwest::get(format!(
        "{}{}",
        API_BASE_URL,
        format!(
            "/initiator/get-servers?cursor={}&pageSize={}",
            0, query_params.page_size
        )
    ))
    .await
    .unwrap()
    .json::<ApiResponse<ResponsePayload>>()
    .await
    .unwrap();
}
