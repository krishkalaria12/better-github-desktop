use std::sync::Arc;

use serde::Serialize;

pub type Result<T> = core::result::Result<T, Error>;

#[derive(Debug)]
pub enum Error {
    TauriPluginStore(Arc<tauri_plugin_store::Error>),
    StoreError(String),
    SerdeJson(serde_json::Error),
}

impl Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

// region:    --- Froms

crate::impl_froms! {
    TauriPluginStore(tauri_plugin_store::Error, arc),
    SerdeJson(serde_json::Error),
}

// endregion: --- Froms

// region:    --- Error Boilerplate
impl core::fmt::Display for Error {
    fn fmt(&self, fmt: &mut core::fmt::Formatter) -> core::result::Result<(), core::fmt::Error> {
        match self {
            Self::TauriPluginStore(e) => write!(fmt, "{e}"),
            Self::StoreError(e) => write!(fmt, "{e}"),
            Self::SerdeJson(e) => write!(fmt, "{e}"),
        }
    }
}

impl std::error::Error for Error {}
// endregion: --- Error Boilerplate
