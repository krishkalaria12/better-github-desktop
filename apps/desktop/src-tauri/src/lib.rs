pub mod auth;
mod config;
mod error;
pub mod repo;
pub mod utils;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            auth::save_auth_token,
            auth::delete_auth_token,
            auth::get_auth_token,
            repo::check_is_git_repo,
            repo::get_last_opened_repo,
            repo::clone::clone_repo,
            repo::status::get_repo_changes,
            repo::file::get_file_diff,
            repo::branch::list_branches,
            repo::commit::get_commits
        ])
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_shell::init());

    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|_app, argv, _cwd| {
              println!("a new app instance was opened with {argv:?} and the deep link event was already triggered");
              // when defining deep link schemes at runtime, you must also check `argv` here
            }));
    }

    builder = builder.plugin(tauri_plugin_deep_link::init());

    builder
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            #[cfg(any(target_os = "linux", all(debug_assertions, windows)))]
            {
                use tauri_plugin_deep_link::DeepLinkExt;
                app.deep_link().register_all()?;
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
