use git2::Commit;
use git2::ErrorCode;
use git2::IndexAddOption;
use git2::Repository;
use tauri::{command, AppHandle};

use crate::repo::{open_repo, Result};

#[command]
pub fn stage_file(app: AppHandle, file_path: String, repo_path: Option<String>) -> Result<()> {
    let repo = open_repo(app.clone(), repo_path)?;
    let mut index = repo.index()?;

    index.add_all([file_path], IndexAddOption::DEFAULT, None)?;

    index.write()?;

    Ok(())
}

#[command]
pub fn stage_all_files(app: AppHandle, repo_path: Option<String>) -> Result<()> {
    let repo = open_repo(app.clone(), repo_path)?;
    let mut index = repo.index()?;

    index.add_all(["."], IndexAddOption::DEFAULT, None)?;
    index.write()?;

    Ok(())
}

fn get_head_commit(repo: &Repository) -> Result<Option<Commit>> {
    match repo.head() {
        Ok(head) => Ok(Some(head.peel_to_commit()?)),
        Err(err) if matches!(err.code(), ErrorCode::UnbornBranch | ErrorCode::NotFound) => Ok(None),
        Err(err) => Err(err.into()),
    }
}

#[command]
pub fn unstage_file(app: AppHandle, file_path: String, repo_path: Option<String>) -> Result<()> {
    let repo = open_repo(app.clone(), repo_path)?;

    let head_commit = get_head_commit(&repo)?;
    let head_object = head_commit.as_ref().map(|commit| commit.as_object());

    repo.reset_default(head_object, [file_path.as_str()])?;

    Ok(())
}

#[command]
pub fn unstage_all_files(app: AppHandle, repo_path: Option<String>) -> Result<()> {
    let repo = open_repo(app.clone(), repo_path)?;

    let head_commit = get_head_commit(&repo)?;
    let head_object = head_commit.as_ref().map(|commit| commit.as_object());

    repo.reset_default(head_object, ["."])?;

    Ok(())
}
