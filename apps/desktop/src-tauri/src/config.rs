use parking_lot::{const_mutex, Mutex};

use crate::error::Result;

pub fn config() -> &'static Config {
    static INSTANCE: Mutex<Option<&'static Config>> = const_mutex(None);

    let mut instance = INSTANCE.lock();
    if let Some(config) = *instance {
        return config;
    }

    let config =
        Box::leak(Box::new(Config::load_the_config().unwrap_or_else(|ex| {
            panic!("FATAL - WHILE LOADING CONF - Cause: {ex:?}")
        })));

    *instance = Some(config);
    config
}

#[allow(non_snake_case)]
pub struct Config {
    // -- Web
    pub SERVICE_NAME: &'static str,
    pub USER_KEY: &'static str,
    pub STORE_NAME: &'static str,
    pub STORE_LAST_OPENED_REPOS_KEY: &'static str,
    pub STORE_REPOS_KEY: &'static str,
}

impl Config {
    fn load_the_config() -> Result<Config> {
        Ok(Config {
            SERVICE_NAME: "better-github-desktop",
            USER_KEY: "session-token",
            STORE_NAME: "settings.json",
            STORE_LAST_OPENED_REPOS_KEY: "last_opened_repo",
            STORE_REPOS_KEY: "repos",
        })
    }
}
