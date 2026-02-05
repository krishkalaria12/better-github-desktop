use crate::{repo::error::Result, repo::open_repo};
use git2::{Status, StatusOptions};
use serde::Serialize;
use tauri::{command, AppHandle};

#[derive(Debug, Serialize)]
pub struct FileChange {
    path: String,
    status: String,
}

#[command]
pub fn get_repo_changes(app: AppHandle, repo_path: Option<String>) -> Result<Vec<FileChange>> {
    let repo = open_repo(app.clone(), repo_path)?;

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
