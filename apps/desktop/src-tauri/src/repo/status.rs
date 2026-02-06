use crate::{
    repo::error::{Result},
    repo::open_repo,
};
use git2::{Oid, Status, StatusOptions};
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

#[command]
pub fn get_repo_changes_from_commit(
    app: AppHandle,
    commit_id: String,
    repo_path: Option<String>,
) -> Result<Vec<FileChange>> {
    let repo = open_repo(app.clone(), repo_path)?;

    let oid = Oid::from_str(&commit_id)?;
    let commit = repo.find_commit(oid)?;
    let tree = commit.tree()?;

    let parent_tree = if commit.parent_count() > 0 {
        let parent = commit.parent(0)?;
        Some(parent.tree()?)
    } else {
        None
    };

    let diff = repo.diff_tree_to_tree(parent_tree.as_ref(), Some(&tree), None)?;
    let mut files: Vec<FileChange> = Vec::new();

    for delta in diff.deltas() {
        let status_char = match delta.status() {
            git2::Delta::Added => "A",
            git2::Delta::Deleted => "D",
            git2::Delta::Modified => "M",
            git2::Delta::Renamed => "R",
            _ => "U",
        };

        let path = if delta.status() == git2::Delta::Deleted {
            delta.old_file().path()
        } else {
            delta.new_file().path()
        };

        if let Some(p) = path {
            files.push(FileChange {
                path: p.to_string_lossy().to_string(),
                status: status_char.to_string(),
            });
        }
    }

    Ok(files)
}
