use std::sync::Arc;

use git2::{
    BranchType, Cred, CredentialType, Error as GitError, FetchOptions, PushOptions, RemoteCallbacks,
};
use parking_lot::Mutex;
use serde::Serialize;
use tauri::{command, AppHandle, Emitter};

use crate::repo::{
    error::{Error, Result},
    open_repo,
};

#[derive(Clone, Serialize)]
struct PushProgressPayload {
    phase: String,
    value: usize,
}

#[derive(Clone, Serialize)]
pub struct PushRepoResult {
    branch_name: String,
    remote_name: String,
    set_upstream: bool,
}

#[command]
pub fn list_remote_branches(app: AppHandle, repo_path: Option<String>) -> Result<Vec<String>> {
    let repo = open_repo(app.clone(), repo_path)?;

    let branches = repo.branches(Some(BranchType::Remote))?;

    let mut branch_names: Vec<String> = Vec::new();
    for branch_res in branches {
        let (branch, _) = branch_res?;

        if let Ok(Some(name)) = branch.name() {
            branch_names.push(name.to_string());
        }
    }

    Ok(branch_names)
}

#[command]
pub fn fetch_repo(app: AppHandle, repo_path: Option<String>, token: Option<String>) -> Result<()> {
    let repo = open_repo(app.clone(), repo_path)?;
    let mut remote = repo.find_remote("origin")?;

    let token = token.and_then(|value| {
        let trimmed = value.trim().to_string();
        if trimmed.is_empty() {
            None
        } else {
            Some(trimmed)
        }
    });

    let mut callbacks = RemoteCallbacks::new();
    callbacks.credentials(move |_url, username_from_url, allowed_types| {
        if let Some(auth_token) = token.as_deref() {
            if allowed_types.contains(CredentialType::USER_PASS_PLAINTEXT) {
                let username = username_from_url.unwrap_or("x-access-token");
                return Cred::userpass_plaintext(username, auth_token);
            }
        }

        if allowed_types.contains(CredentialType::SSH_KEY) {
            if let Some(username) = username_from_url {
                return Cred::ssh_key_from_agent(username);
            }
        }

        if allowed_types.contains(CredentialType::USERNAME) {
            return Cred::username(username_from_url.unwrap_or("git"));
        }

        Cred::default()
    });

    let mut fetch_options = FetchOptions::new();
    fetch_options.remote_callbacks(callbacks);

    remote.fetch(&[] as &[&str], Some(&mut fetch_options), None)?;

    Ok(())
}

#[command]
pub fn push_repo(
    app: AppHandle,
    repo_path: Option<String>,
    token: Option<String>,
) -> Result<PushRepoResult> {
    let repo = open_repo(app.clone(), repo_path)?;
    let remote_name = "origin".to_string();

    let head = repo.head()?;
    if !head.is_branch() {
        return Err(Error::RepoOpeningError(
            "Cannot push while HEAD is detached".to_string(),
        ));
    }

    let branch_name = head
        .shorthand()
        .map(|value| value.to_string())
        .ok_or_else(|| {
            Error::RepoOpeningError("Unable to resolve current branch name".to_string())
        })?;

    let mut local_branch = repo.find_branch(&branch_name, BranchType::Local)?;
    let mut set_upstream = false;

    if local_branch.upstream().is_err() {
        let upstream_name = format!("{}/{}", remote_name, branch_name);
        local_branch.set_upstream(Some(&upstream_name))?;
        set_upstream = true;
    }

    let mut remote = repo.find_remote(&remote_name)?;
    let token = token.and_then(|value| {
        let trimmed = value.trim().to_string();
        if trimmed.is_empty() {
            None
        } else {
            Some(trimmed)
        }
    });

    let app_handle = app.clone();
    let push_progress = Arc::new(Mutex::new(0usize));
    let mut callbacks = RemoteCallbacks::new();
    callbacks.credentials(move |_url, username_from_url, allowed_types| {
        if let Some(auth_token) = token.as_deref() {
            if allowed_types.contains(CredentialType::USER_PASS_PLAINTEXT) {
                let username = username_from_url.unwrap_or("x-access-token");
                return Cred::userpass_plaintext(username, auth_token);
            }
        }

        if allowed_types.contains(CredentialType::SSH_KEY) {
            if let Some(username) = username_from_url {
                return Cred::ssh_key_from_agent(username);
            }
        }

        if allowed_types.contains(CredentialType::USERNAME) {
            return Cred::username(username_from_url.unwrap_or("git"));
        }

        Cred::default()
    });

    let progress_app_handle = app_handle.clone();
    let progress_ref = push_progress.clone();
    callbacks.push_transfer_progress(move |current, total, _bytes| {
        if total == 0 {
            return;
        }

        let percent = (current * 100) / total;
        let mut last_percent = progress_ref.lock();
        if percent > *last_percent {
            *last_percent = percent;
            let _ = progress_app_handle.emit(
                "push-progress",
                PushProgressPayload {
                    phase: "Pushing commits".to_string(),
                    value: percent,
                },
            );
        }
    });

    callbacks.push_update_reference(move |reference_name, status| {
        if let Some(rejection) = status {
            let message = format!("Push rejected for {}: {}", reference_name, rejection);
            return Err(GitError::from_str(&message));
        }
        Ok(())
    });

    let mut push_options = PushOptions::new();
    push_options.remote_callbacks(callbacks);

    let push_refspec = format!("refs/heads/{0}:refs/heads/{0}", branch_name);
    remote.push(&[push_refspec.as_str()], Some(&mut push_options))?;

    let _ = app_handle.emit(
        "push-progress",
        PushProgressPayload {
            phase: "Push completed".to_string(),
            value: 100,
        },
    );

    Ok(PushRepoResult {
        branch_name,
        remote_name,
        set_upstream,
    })
}
