use serde::{Deserialize, Serialize};

pub mod get_server_mods_meta;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub code: String, // TODO: 计划迁移至 `ErrorCode` 以获得更精确的错误处理
    pub message: Option<String>,
    pub payload: T,
}
