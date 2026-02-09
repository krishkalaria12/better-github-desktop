use git2::{build::CheckoutBuilder, BranchType};
use serde::Serialize;
use tauri::{command, AppHandle};

use crate::{repo::error::Result, repo::open_repo};

#[derive(Clone, Serialize)]
pub struct BranchInfo {
    name: String,
    type_of: String,
    is_head: bool,
}

#[derive(Clone, Serialize)]
pub struct MergeAnalysisResult {
    analysis: String,
    source_branch: String,
    target_branch: String,
}

#[derive(Clone, Serialize)]
pub struct FastForwardResult {
    source_branch: String,
    target_branch: String,
    target_oid: String,
}

#[derive(Clone, Serialize)]
pub struct NormalMergeResult {
    source_branch: String,
    target_branch: String,
    commit_oid: String,
}

fn get_branch_oid(repo: &git2::Repository, branch_name: &str) -> Result<git2::Oid> {
    let ref_name = format!("refs/heads/{}", branch_name);
    let reference = repo.find_reference(&ref_name)?;
    reference.target().ok_or_else(|| {
        crate::repo::error::Error::RepoOpeningError(format!(
            "Unable to resolve branch tip for {}",
            branch_name
        ))
    })
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

#[command]
pub fn create_branch(app: AppHandle, repo_path: Option<String>, branch_name: String) -> Result<()> {
    let repo = open_repo(app.clone(), repo_path)?;

    let head = repo.head()?;
    let commit = head.peel_to_commit()?;

    repo.branch(&branch_name, &commit, false)?;

    Ok(())
}

#[command]
pub fn checkout_branch(
    app: AppHandle,
    repo_path: Option<String>,
    branch_name: String,
) -> Result<()> {
    let repo = open_repo(app.clone(), repo_path.clone())?;

    let ref_name = format!("refs/heads/{}", branch_name);

    let obj = repo.revparse_single(&ref_name)?;

    repo.checkout_tree(&obj, None)?;
    repo.set_head(&ref_name)?;

    Ok(())
}

#[command]
pub fn merge_analysis(
    app: AppHandle,
    repo_path: Option<String>,
    source_branch: String,
    target_branch: String,
) -> Result<MergeAnalysisResult> {
    let repo = open_repo(app.clone(), repo_path)?;

    let source_oid = get_branch_oid(&repo, &source_branch)?;
    let target_oid = get_branch_oid(&repo, &target_branch)?;

    let analysis = if source_oid == target_oid {
        "up_to_date"
    } else {
        let merge_base = repo.merge_base(source_oid, target_oid)?;
        if merge_base == target_oid {
            "fast_forward"
        } else if merge_base == source_oid {
            "up_to_date"
        } else {
            "normal_merge"
        }
    };

    Ok(MergeAnalysisResult {
        analysis: analysis.to_string(),
        source_branch,
        target_branch,
    })
}

#[command]
pub fn fast_forward(
    app: AppHandle,
    repo_path: Option<String>,
    source_branch: String,
    target_branch: String,
) -> Result<FastForwardResult> {
    let repo = open_repo(app.clone(), repo_path)?;

    let source_oid = get_branch_oid(&repo, &source_branch)?;
    let target_oid = get_branch_oid(&repo, &target_branch)?;
    let merge_base = repo.merge_base(source_oid, target_oid)?;

    if merge_base != target_oid {
        return Err(crate::repo::error::Error::RepoOpeningError(format!(
            "Fast-forward is not possible from {} into {}",
            source_branch, target_branch
        )));
    }

    let target_ref_name = format!("refs/heads/{}", target_branch);
    let mut target_ref = repo.find_reference(&target_ref_name)?;
    target_ref.set_target(source_oid, "fast-forward")?;

    let should_checkout = repo
        .head()
        .ok()
        .and_then(|head| head.shorthand().map(|value| value.to_string()))
        .map(|head_branch| head_branch == target_branch)
        .unwrap_or(false);

    if should_checkout {
        repo.set_head(&target_ref_name)?;
        let mut checkout_builder = CheckoutBuilder::new();
        checkout_builder.force();
        repo.checkout_head(Some(&mut checkout_builder))?;
    }

    Ok(FastForwardResult {
        source_branch,
        target_branch,
        target_oid: source_oid.to_string(),
    })
}

#[command]
pub fn normal_merge(
    app: AppHandle,
    repo_path: Option<String>,
    source_branch: String,
    target_branch: String,
) -> Result<NormalMergeResult> {
    let repo = open_repo(app.clone(), repo_path)?;

    let source_oid = get_branch_oid(&repo, &source_branch)?;
    let target_oid = get_branch_oid(&repo, &target_branch)?;
    let merge_base = repo.merge_base(source_oid, target_oid)?;

    if merge_base == source_oid || merge_base == target_oid {
        return Err(crate::repo::error::Error::RepoOpeningError(
            "Normal merge is not required for this branch pair".to_string(),
        ));
    }

    let source_ref_name = format!("refs/heads/{}", source_branch);
    let source_ref = repo.find_reference(&source_ref_name)?;
    let source_annotated = repo.reference_to_annotated_commit(&source_ref)?;

    let mut checkout_builder = CheckoutBuilder::new();
    checkout_builder.force();
    repo.merge(&[&source_annotated], None, Some(&mut checkout_builder))?;

    let mut index = repo.index()?;
    if index.has_conflicts() {
        repo.cleanup_state()?;
        return Err(crate::repo::error::Error::RepoOpeningError(
            "Merge resulted in conflicts. Resolve manually.".to_string(),
        ));
    }

    let tree_oid = index.write_tree_to(&repo)?;
    let tree = repo.find_tree(tree_oid)?;

    let target_commit = repo.find_commit(target_oid)?;
    let source_commit = repo.find_commit(source_oid)?;
    let signature = repo.signature()?;
    let message = format!("merge branch '{}' into '{}'", source_branch, target_branch);
    let target_ref_name = format!("refs/heads/{}", target_branch);

    let commit_oid = repo.commit(
        Some(&target_ref_name),
        &signature,
        &signature,
        &message,
        &tree,
        &[&target_commit, &source_commit],
    )?;

    repo.cleanup_state()?;

    let should_checkout = repo
        .head()
        .ok()
        .and_then(|head| head.shorthand().map(|value| value.to_string()))
        .map(|head_branch| head_branch == target_branch)
        .unwrap_or(false);

    if should_checkout {
        let mut post_merge_checkout = CheckoutBuilder::new();
        post_merge_checkout.force();
        repo.checkout_head(Some(&mut post_merge_checkout))?;
    }

    Ok(NormalMergeResult {
        source_branch,
        target_branch,
        commit_oid: commit_oid.to_string(),
    })
}
