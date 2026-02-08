use git2::{Cred, CredentialType, FetchOptions, RemoteCallbacks};
use tauri::{command, AppHandle};

use crate::repo::{error::Result, open_repo};

#[command]
pub fn list_remote_branches(app: AppHandle, repo_path: Option<String>) -> Result<Vec<String>> {
    let repo = open_repo(app.clone(), repo_path)?;

    let branches = repo.branches(Some(git2::BranchType::Remote))?;

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
