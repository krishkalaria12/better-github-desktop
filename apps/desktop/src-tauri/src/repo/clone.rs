use std::{
    path::Path,
    sync::Arc,
};

use git2::{build::RepoBuilder, FetchOptions, RemoteCallbacks};
use parking_lot::Mutex;
use serde::Serialize;
use tauri::{command, AppHandle, Emitter};

use crate::repo::save_repos_in_store;
use crate::repo::error::{Error, Result};

#[derive(Clone, Serialize)]
struct CloneProgressPayload {
    phase: String,
    value: usize,
}

#[command]
pub async fn clone_repo(url: String, file_path: String, app: AppHandle) -> Result<()> {
    let app_handle = app.clone();
    let mut callbacks = RemoteCallbacks::new();
    let progress = Arc::new(Mutex::new(0));

    callbacks.transfer_progress(move |stats| {
        let total = stats.total_objects();
        let current = stats.received_objects();

        if total > 0 {
            let percent = (current * 100) / total;

            let mut last_percent = progress.lock();
            if percent > *last_percent {
                *last_percent = percent;

                // emit the event
                let _ = app_handle.emit(
                    "clone-progress",
                    CloneProgressPayload {
                        phase: "Downloading Objects".to_string(),
                        value: percent,
                    },
                );
            }
        }

        true // continue downloading
    });

    let mut fetch_options = FetchOptions::new();
    fetch_options.remote_callbacks(callbacks);

    let mut builder = RepoBuilder::new();
    builder.fetch_options(fetch_options);

    match builder.clone(&url, Path::new(&file_path)) {
        Ok(_) => {
            save_repos_in_store(file_path, app)?;
            Ok(())
        }
        Err(e) => return Err(Error::from(e)),
    }
}
