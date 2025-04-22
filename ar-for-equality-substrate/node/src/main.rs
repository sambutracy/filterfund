// filepath: ar-for-equality-substrate/ar-for-equality-substrate/node/src/main.rs
use sc_cli::{CliConfiguration, CommandFactory};
use sc_service::{Configuration, TaskManager};
use sp_runtime::traits::Block as BlockT;

fn main() -> Result<(), sc_cli::Error> {
    let cli = CliConfiguration::new();
    let command_factory = CommandFactory::new(&cli);
    let config = Configuration::new(&cli)?;

    let task_manager = TaskManager::new(config)?;

    // Start the node
    let _ = task_manager.spawn();

    // Keep the application running
    futures::executor::block_on(task_manager.run())?;

    Ok(())
}