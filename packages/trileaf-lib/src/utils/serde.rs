/// SHA-512 或 SHA-1 的反序列化模块。
pub mod serde_sha512_or_sha1_as_hex {
    use serde::{Deserializer, Serializer, de::Error};

    use crate::types::sha::Sha512OrSha1Hash;

    pub fn serialize<S>(
        hash: &Sha512OrSha1Hash,
        serializer: S,
    ) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let hex_string = match hash {
            Sha512OrSha1Hash::Sha512(h) => hex::encode(h),
            Sha512OrSha1Hash::Sha1(h) => hex::encode(h),
        };
        serializer.serialize_str(&hex_string)
    }

    pub fn deserialize<'de, D>(
        deserializer: D,
    ) -> Result<Sha512OrSha1Hash, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s: &str = serde::Deserialize::deserialize(deserializer)?;

        match s.len() {
            // SHA-512 (64 * 2 = 128)
            128 => {
                let bytes = hex::decode(s).map_err(Error::custom)?;
                let array: [u8; 64] = bytes.try_into().map_err(|_| {
                    Error::custom(
                        "internal error: decoded hex string was not 64 bytes",
                    )
                })?;
                Ok(Sha512OrSha1Hash::Sha512(array.into()))
            }
            // SHA-1 (20 * 2 = 40)
            40 => {
                let bytes = hex::decode(s).map_err(Error::custom)?;
                let array: [u8; 20] = bytes.try_into().map_err(|_| {
                    Error::custom(
                        "internal error: decoded hex string was not 20 bytes",
                    )
                })?;
                Ok(Sha512OrSha1Hash::Sha1(array.into()))
            }
            other => Err(Error::custom(format!(
                "expected a hex string of length 128 (SHA-512) or 40 (SHA-1), but got length {}",
                other
            ))),
        }
    }
}
