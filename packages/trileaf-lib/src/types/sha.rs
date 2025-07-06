use generic_array::{
    GenericArray,
    typenum::{U20, U64},
};

/// SHA-512 哈希
pub type Sha512Hash = GenericArray<u8, U64>;
/// SHA-1 哈希
pub type Sha1Hash = GenericArray<u8, U20>;

/// 此枚举用于表示可能的 SHA-512 或 SHA-1 值。
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Sha512OrSha1Hash {
    Sha512(Sha512Hash),
    Sha1(Sha1Hash),
}
