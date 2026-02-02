use std::sync::OnceLock;

use crate::error::Result;

pub fn config() -> &'static Config {
    static INSTANCE: OnceLock<Config> = OnceLock::new();

    INSTANCE.get_or_init(|| {
        Config::load_the_config()
            .unwrap_or_else(|ex| panic!("FATAL - WHILE LOADING CONF - Cause: {ex:?}"))
    })
}

#[allow(non_snake_case)]
pub struct Config {
    // -- Web
    pub SERVICE_NAME: &'static str,
    pub USER_KEY: &'static str,
}

impl Config {
    fn load_the_config() -> Result<Config> {
        Ok(Config {
            SERVICE_NAME: "better-github-desktop",
            USER_KEY: "session-token",
        })
    }
}
