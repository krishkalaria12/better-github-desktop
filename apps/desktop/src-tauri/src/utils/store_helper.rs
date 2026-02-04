use serde_json::{json, Value};
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

use crate::{config::config, repo::error::Result};

pub fn get_last_opened_repo_path(app: AppHandle) -> Result<Value> {
    let store = app.store(&config().STORE_NAME)?;
    let last_opened_repo_path = store
        .get(&config().STORE_LAST_OPENED_REPOS_KEY)
        .unwrap_or(json!(""));

    Ok(last_opened_repo_path)
}
