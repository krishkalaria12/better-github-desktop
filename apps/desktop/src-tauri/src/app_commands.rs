use crate::{auth, repo};
use tauri::ipc::Invoke;

pub fn get_handler() -> impl Fn(Invoke) -> bool {
    tauri::generate_handler![
        auth::save_auth_token,
        auth::delete_auth_token,
        auth::get_auth_token,
        repo::check_is_git_repo,
        repo::get_last_opened_repo,
        repo::clone::clone_repo,
        repo::status::get_repo_changes,
        repo::file::get_file_diff,
        repo::branch::list_branches,
        repo::commit::get_commits,
        repo::file::get_file_diff_by_commit,
        repo::status::get_repo_changes_from_commit,
        repo::staging::stage_file,
        repo::staging::stage_all_files,
        repo::staging::unstage_file,
        repo::staging::unstage_all_files,
        repo::commit::commit,
        repo::branch::create_branch,
        repo::branch::checkout_branch,
        repo::branch::merge_analysis,
        repo::branch::fast_forward,
        repo::remote::fetch_repo,
        repo::remote::push_repo
    ]
}
