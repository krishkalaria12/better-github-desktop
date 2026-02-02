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

#[command]
pub fn delete_auth_token() -> Result<()> {
    let entry = Entry::new(config().SERVICE_NAME, config().USER_KEY)?;
    entry.delete_credential()?;

    Ok(())
}

#[command]
pub fn get_auth_token() -> Result<String> {
    let entry = Entry::new(config().SERVICE_NAME, config().USER_KEY)?;
    let token = entry.get_password()?;

    Ok(token)
}
