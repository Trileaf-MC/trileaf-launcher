/// Sha512 的反序列化模块。
pub mod serde_sha512_as_hex {
    use serde::{Deserializer, Serializer, de::Error};
    use std::convert::TryInto;

    use crate::types::sha::Sha512Hash;

    pub fn serialize<S>(
        hash: &Sha512Hash,
        serializer: S,
    ) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let s = hex::encode(hash);
        serializer.serialize_str(&s)
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<Sha512Hash, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s: String = serde::Deserialize::deserialize(deserializer)?;
        let bytes: Vec<u8> = hex::decode(s).map_err(Error::custom)?;

        let array: [u8; 64] = bytes.try_into().map_err(|v: Vec<u8>| {
            Error::custom(format!(
                "expected a 64-byte array, but got {} bytes.",
                v.len()
            ))
        })?;

        Ok(array.into())
    }
}
