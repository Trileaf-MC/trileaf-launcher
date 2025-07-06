use generic_array::{GenericArray, typenum::U64};

/// Sha512 哈希
pub type Sha512Hash = GenericArray<u8, U64>;
