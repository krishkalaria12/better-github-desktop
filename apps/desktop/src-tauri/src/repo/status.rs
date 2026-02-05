use crate::{
    repo::error::Error, repo::error::Result, utils::store_helper::get_last_opened_repo_path,
};
use git2::{Repository, Status, StatusOptions};
use serde::Serialize;
use tauri::{command, AppHandle};

#[derive(Debug, Serialize)]
pub struct FileChange {
    path: String,
    status: String,
}

#[command]
pub fn get_repo_changes(app: AppHandle, repo_path: Option<String>) -> Result<Vec<FileChange>> {
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

    let repo = if let Some(path) = provided_path.clone() {
        match Repository::open(&path) {
            Ok(repo) => repo,
            Err(_) => {
                if stored_path.is_empty() || stored_path == path {
                    return Err(Error::RepoOpeningError(format!(
                        "Failed to open repository at {}",
                        path
                    )));
                }
                Repository::open(&stored_path).map_err(|_| {
                    Error::RepoOpeningError(format!(
                        "Failed to open repository at {} or {}",
                        path, stored_path
                    ))
                })?
            }
        }
    } else if !stored_path.is_empty() {
        Repository::open(&stored_path).map_err(|_| {
            Error::RepoOpeningError(format!("Failed to open repository at {}", stored_path))
        })?
    } else {
        return Err(Error::RepoOpeningError(
            "No repository path available".to_string(),
        ));
    };

    let mut opts = StatusOptions::new();
    opts.include_untracked(true).recurse_untracked_dirs(true);

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
