pub mod clone;
pub mod error;

use crate::{
    config::config,
    repo::error::{Error, Result},
};

use serde_json::json;
use std::path::Path;
use tauri::command;
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

fn save_repos_in_store(folder_path: String, app: AppHandle) -> Result<()> {
    let store = app.store(&config().STORE_NAME)?;

    let mut repos = store.get(&config().STORE_REPOS_KEY).unwrap_or(json!([]));

    if let Some(arr) = repos.as_array_mut() {
        if !arr.contains(&json!(folder_path)) {
            arr.push(json!(folder_path));
        }
    }

    store.set(config().STORE_REPOS_KEY, repos);
    store.set(config().STORE_LAST_OPENED_REPOS_KEY, json!(folder_path));

    store.save().map_err(|e| Error::StoreError(e.to_string()))?;
    Ok(())
}

#[command]
pub fn check_is_git_repo(path: Option<String>, app: AppHandle) -> bool {
    let folder_path = match path {
        Some(p) => p,
        None => return false,
    };

    let git_path = Path::new(&folder_path).join(".git");
    let is_repo = git_path.exists();

    if is_repo {
        if let Err(e) = save_repos_in_store(folder_path, app) {
            eprintln!("Failed to save repo: {}", e);
        }
    }

    is_repo
}

#[command]
pub fn get_last_opened_repo(app: AppHandle) -> Result<String> {
    let store = app.store(&config().STORE_NAME)?;
    let last_opened_repo = store
        .get(&config().STORE_LAST_OPENED_REPOS_KEY)
        .unwrap_or(json!(""));

    let path = last_opened_repo.as_str().unwrap_or("").to_string();
    Ok(path)
}
