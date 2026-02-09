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

pub fn get_repo_paths(app: AppHandle) -> Result<Vec<String>> {
    let store = app.store(&config().STORE_NAME)?;
    let repos_value = store.get(&config().STORE_REPOS_KEY).unwrap_or(json!([]));

    let repos = repos_value
        .as_array()
        .map(|items| {
            items
                .iter()
                .filter_map(|item| item.as_str().map(|path| path.trim().to_string()))
                .filter(|path| !path.is_empty())
                .collect::<Vec<String>>()
        })
        .unwrap_or_default();

    Ok(repos)
}
