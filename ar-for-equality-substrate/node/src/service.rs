// filepath: ar-for-equality-substrate/ar-for-equality-substrate/node/src/service.rs
use sp_runtime::traits::Block as BlockT;
use sp_api::ApiError;
use sp_blockchain::Blockchain;
use sp_consensus::Consensus;
use sp_executor::Executor;
use sp_runtime::RuntimeAppPublic;

pub struct Service<B: BlockT, C: Consensus<B>, E: Executor<B>> {
    blockchain: Blockchain<B>,
    consensus: C,
    executor: E,
}

impl<B: BlockT, C: Consensus<B>, E: Executor<B>> Service<B, C, E> {
    pub fn new(blockchain: Blockchain<B>, consensus: C, executor: E) -> Self {
        Self {
            blockchain,
            consensus,
            executor,
        }
    }

    pub fn start(&mut self) -> Result<(), ApiError> {
        // Initialize the service components
        self.blockchain.initialize()?;
        self.consensus.start()?;
        self.executor.start()?;
        
        Ok(())
    }

    pub fn stop(&mut self) {
        // Stop the service components
        self.executor.stop();
        self.consensus.stop();
        self.blockchain.stop();
    }
}