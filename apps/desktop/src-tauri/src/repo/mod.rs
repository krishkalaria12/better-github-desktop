pub mod branch;
pub mod clone;
pub mod commit;
pub mod error;
pub mod file;
pub mod remote;
pub mod staging;
pub mod status;

use crate::{
    config::config,
    repo::error::{Error, Result},
    utils::store_helper::{get_last_opened_repo_path, get_repo_paths},
};

use git2::Repository;
use serde::Serialize;
use serde_json::json;
use std::path::Path;
use tauri::command;
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

#[derive(Clone, Serialize)]
pub struct RepoState {
    repos: Vec<String>,
    active_repo: Option<String>,
}

pub(crate) fn save_repos_in_store(folder_path: String, app: AppHandle) -> Result<()> {
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

fn normalize_repo_path(path: String) -> Option<String> {
    let trimmed = path.trim().to_string();
    if trimmed.is_empty() {
        None
    } else {
        Some(trimmed)
    }
}

fn get_repo_state_from_store(app: AppHandle) -> Result<RepoState> {
    let mut repos = get_repo_paths(app.clone())?;
    let active_path = get_last_opened_repo_path(app)?
        .as_str()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty());

    if let Some(active) = active_path.clone() {
        if !repos.contains(&active) {
            repos.push(active);
        }
    }

    Ok(RepoState {
        repos,
        active_repo: active_path,
    })
}

pub(crate) fn open_repo(app: AppHandle, repo_path: Option<String>) -> Result<Repository> {
    let repo_json = get_last_opened_repo_path(app.clone())?;
    let stored_path = repo_json.as_str().unwrap_or("").trim().to_string();
    let provided_path = repo_path.and_then(|path| {
        let trimmed = path.trim().to_string();
        if trimmed.is_empty() {
            None
        } else {
            Some(trimmed)
        }
    });

    if let Some(path) = provided_path.clone() {
        match Repository::open(&path) {
            Ok(repo) => Ok(repo),
            Err(_) => {
                if stored_path.is_empty() || stored_path == path {
                    Err(Error::RepoOpeningError(format!(
                        "Failed to open repository at {}",
                        path
                    )))
                } else {
                    Repository::open(&stored_path).map_err(|_| {
                        Error::RepoOpeningError(format!(
                            "Failed to open repository at {} or {}",
                            path, stored_path
                        ))
                    })
                }
            }
        }
    } else if !stored_path.is_empty() {
        Repository::open(&stored_path).map_err(|_| {
            Error::RepoOpeningError(format!("Failed to open repository at {}", stored_path))
        })
    } else {
        Err(Error::RepoOpeningError(
            "No repository path available".to_string(),
        ))
    }
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
    let repo_json = get_last_opened_repo_path(app)?;
    let path = repo_json.as_str().unwrap_or("").to_string();
    Ok(path)
}

#[command]
pub fn get_repo_state(app: AppHandle) -> Result<RepoState> {
    get_repo_state_from_store(app)
}

#[command]
pub fn set_active_repo(app: AppHandle, repo_path: String) -> Result<RepoState> {
    let target_path = normalize_repo_path(repo_path).ok_or_else(|| {
        Error::StoreError("Repository path is required to set active repo".to_string())
    })?;
    let mut repos = get_repo_paths(app.clone())?;
    if !repos.contains(&target_path) {
        repos.push(target_path.clone());
    }

    let store = app.store(&config().STORE_NAME)?;
    store.set(config().STORE_REPOS_KEY, json!(repos));
    store.set(config().STORE_LAST_OPENED_REPOS_KEY, json!(target_path));
    store.save().map_err(|e| Error::StoreError(e.to_string()))?;

    get_repo_state_from_store(app)
}

#[command]
pub fn remove_repo_from_view(app: AppHandle, repo_path: String) -> Result<RepoState> {
    let target_path = normalize_repo_path(repo_path).ok_or_else(|| {
        Error::StoreError("Repository path is required to remove repo".to_string())
    })?;

    let mut repos = get_repo_paths(app.clone())?;
    repos.retain(|repo| repo != &target_path);

    let current_active = get_last_opened_repo_path(app.clone())?
        .as_str()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty());

    let next_active = match current_active {
        Some(active) if active == target_path => repos.last().cloned(),
        Some(active) if repos.contains(&active) => Some(active),
        _ => repos.last().cloned(),
    };

    let store = app.store(&config().STORE_NAME)?;
    store.set(config().STORE_REPOS_KEY, json!(repos));
    store.set(
        config().STORE_LAST_OPENED_REPOS_KEY,
        json!(next_active.clone().unwrap_or_default()),
    );
    store.save().map_err(|e| Error::StoreError(e.to_string()))?;

    Ok(RepoState {
        repos: get_repo_paths(app.clone())?,
        active_repo: next_active,
    })
}
