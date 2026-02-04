use std::{fs, path::Path, str::from_utf8};

use git2::Repository;
use serde::Serialize;
use tauri::command;

use crate::{
    repo::error::{Error, Result},
    utils::store_helper::get_last_opened_repo_path,
};

#[derive(Serialize)]
pub struct DiffState {
    new_content: String,
    old_content: String,
}

#[command]
pub fn get_file_diff(path: String, app: tauri::AppHandle) -> Result<DiffState> {
    // set the repo with the path
    let repo_json = get_last_opened_repo_path(app.clone())?;
    let repo_path = repo_json.as_str().unwrap_or("");
    let repo = Repository::open(repo_path).map_err(|e| Error::RepoOpeningError(e.to_string()))?;

    let full_path = Path::new(repo_path).join(&path);
    let new_content = fs::read_to_string(full_path).unwrap_or(String::from(""));

    let old_content = get_file_content_from_head(&repo, &path).unwrap_or(String::from(""));

    Ok(DiffState {
        new_content,
        old_content,
    })
}

fn get_file_content_from_head(repo: &Repository, path: &str) -> Result<String> {
    let head_commit = repo.head()?.peel_to_commit()?;

    let tree = head_commit.tree()?;
    let entry = tree.get_path(Path::new(path))?;

    let object = entry.to_object(&repo)?;
    let blob = object
        .as_blob()
        .ok_or(git2::Error::from_str("Path is not a blob"))?;

    let content =
        from_utf8(blob.content()).map_err(|_| git2::Error::from_str("File is not valid UTF-8"))?;

    Ok(content.to_string())
}
