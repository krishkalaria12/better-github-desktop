use git2::BranchType;
use serde::Serialize;
use tauri::{command, AppHandle};

use crate::{repo::error::Result, repo::open_repo};

#[derive(Clone, Serialize)]
pub struct BranchInfo {
    name: String,
    type_of: String,
    is_head: bool,
}

#[command]
pub fn list_branches(app: AppHandle) -> Result<Vec<BranchInfo>> {
    let repo = open_repo(app.clone(), None)?;

    let branches = repo.branches(None)?;

    let mut all_branches: Vec<BranchInfo> = Vec::new();

    for branch_res in branches {
        let (branch, branch_type) = branch_res?;

        let name = branch.name()?;

        if let Some(name) = name {
            if name.ends_with("/HEAD") {
                continue;
            }

            let (bran_type, is_head) = match branch_type {
                BranchType::Local => ("Local", branch.is_head()),
                BranchType::Remote => ("Remote", false),
            };

            all_branches.push(BranchInfo {
                name: name.to_string(),
                type_of: bran_type.to_string(),
                is_head,
            });
        }
    }

    Ok(all_branches)
}
