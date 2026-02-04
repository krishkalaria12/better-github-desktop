use git2::{Repository, Status, StatusOptions};
use serde::Serialize;
use serde_json::json;
use tauri::{command, AppHandle};
use tauri_plugin_store::StoreExt;

use crate::{config::config, repo::error::Result};

#[derive(Debug, Serialize)]
pub struct FileChange {
    path: String,
    status: String,
}

#[command]
pub fn get_repo_changes(app: AppHandle) -> Result<Vec<FileChange>> {
    // get the repo path
    let store = app.store(&config().STORE_NAME)?;
    let last_opened_repo = store
        .get(&config().STORE_LAST_OPENED_REPOS_KEY)
        .unwrap_or(json!(""));

    let repo_path = last_opened_repo.as_str().unwrap_or("").to_string();

    let mut opts = StatusOptions::new();
    opts.include_untracked(true).recurse_untracked_dirs(true);

    let repo = Repository::open(repo_path)?;
    let statuses = repo.statuses(Some(&mut opts))?;

    let mut changes: Vec<FileChange> = Vec::new();

    for entry in statuses.iter() {
        let status = entry.status();
        let path = entry.path().unwrap_or("");

        if status.contains(Status::WT_NEW) {
            changes.push(FileChange {
                path: path.to_string(),
                status: "New".to_string(),
            });
        } else if status.contains(Status::WT_DELETED) {
            changes.push(FileChange {
                path: path.to_string(),
                status: "Deleted".to_string(),
            });
        } else if status.contains(Status::WT_MODIFIED) {
            changes.push(FileChange {
                path: path.to_string(),
                status: "Modified".to_string(),
            });
        }
    }

    Ok(changes)
}
