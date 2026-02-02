pub mod error;

use keyring::Entry;
use tauri::command;

use crate::auth::error::Result;
use crate::config::config;

#[command]
pub fn save_auth_token(token_str: String) -> Result<()> {
    let entry = Entry::new(config().SERVICE_NAME, config().USER_KEY)?;

    entry.set_password(&token_str)?;

    Ok(())
}
