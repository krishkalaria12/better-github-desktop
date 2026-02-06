use chrono::{DateTime, FixedOffset};
use git2::{Parents, Sort, Time};
use serde::Serialize;
use tauri::{command, AppHandle};

use crate::{repo::error::Result, repo::open_repo};

#[derive(Serialize)]
pub struct CommitInfo {
    oid: String,
    short_oid: String,
    message: String,
    author_name: String,
    author_email: String,
    date: String,
    parents: Vec<String>,
}

#[command]
pub fn get_commits(
    app: AppHandle,
    page_size: usize,
    repo_path: Option<String>,
) -> Result<Vec<CommitInfo>> {
    let repo = open_repo(app.clone(), repo_path)?;

    let mut revwalk = repo.revwalk()?;
    revwalk.push_head()?;

    revwalk.set_sorting(Sort::TIME)?;

    let mut all_commits: Vec<CommitInfo> = Vec::new();
    for commit_id in revwalk.take(page_size) {
        let commit_id = commit_id?;
        let commit = repo.find_commit(commit_id)?;

        let author_name = commit.author().name().unwrap_or("Unknown").to_string();
        let author_email = commit.author().email().unwrap_or("").to_string();
        let short_oid = commit_id.to_string()[..7].to_string();
        let message = commit.message().unwrap_or("Message").to_string();
        let date = convert_date(commit.time());
        let parents = get_parents(commit.parents());

        all_commits.push(CommitInfo {
            oid: commit_id.to_string(),
            short_oid: short_oid,
            message: message,
            author_name: author_name,
            author_email: author_email,
            date: date,
            parents: parents,
        });
    }

    Ok(all_commits)
}

fn convert_date(time: Time) -> String {
    let offset_secs = time.offset_minutes() * 60;
    let offset =
        FixedOffset::east_opt(offset_secs).unwrap_or_else(|| FixedOffset::east_opt(0).unwrap());

    let utc_time = DateTime::from_timestamp(time.seconds(), 0).unwrap_or_default();

    let local_time = utc_time.with_timezone(&offset);

    local_time.to_rfc3339()
}

fn get_parents(parents: Parents) -> Vec<String> {
    let mut all_parents: Vec<String> = Vec::new();

    for parent in parents {
        let parent_id = parent.id().to_string();
        all_parents.push(parent_id);
    }

    all_parents
}

#[command]
pub fn commit(app: AppHandle, repo_path: Option<String>, message: String) -> Result<String> {
    // get the index and write it
    let repo = open_repo(app.clone(), repo_path)?;
    let mut index = repo.index()?;

    let tree_oid = index.write_tree()?;
    let tree = repo.find_tree(tree_oid)?;

    // Get the parent
    let signature = repo.signature()?;
    let head = repo.head();

    let parent_commit = match head {
        Ok(head) => Some(head.peel_to_commit()?),
        Err(_) => None,
    };

    let parents = if let Some(ref commit) = parent_commit {
        vec![commit]
    } else {
        vec![]
    };

    // commit the changes
    let commit_id = repo.commit(
        Some("HEAD"),
        &signature,
        &signature,
        &message,
        &tree,
        &parents,
    )?;

    Ok(commit_id.to_string())
}
