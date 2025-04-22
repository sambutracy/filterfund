// filepath: ar-for-equality-substrate/ar-for-equality-substrate/node/src/command.rs
use crate::{cli::Cli, service::Service};
use sc_cli::{CommandBase, Error as CliError};
use std::sync::Arc;

pub struct Command {
    service: Arc<Service>,
}

impl Command {
    pub fn new(service: Arc<Service>) -> Self {
        Self { service }
    }

    pub async fn start(&self) -> Result<(), CliError> {
        self.service.start().await.map_err(|e| {
            eprintln!("Failed to start the service: {:?}", e);
            CliError::from(e)
        })?;
        Ok(())
    }

    pub async fn execute_task(&self, task_id: u32) -> Result<(), CliError> {
        self.service.execute_task(task_id).await.map_err(|e| {
            eprintln!("Failed to execute task {}: {:?}", task_id, e);
            CliError::from(e)
        })?;
        Ok(())
    }
}