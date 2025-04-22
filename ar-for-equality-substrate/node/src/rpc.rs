// filepath: ar-for-equality-substrate/ar-for-equality-substrate/node/src/rpc.rs
use jsonrpc_core::{IoHandler, Result};
use jsonrpc_derive::rpc;
use crate::service::Service;

#[rpc]
pub trait Rpc {
    #[rpc(name = "getCampaigns")]
    fn get_campaigns(&self) -> Result<Vec<Campaign>>;
    
    #[rpc(name = "createCampaign")]
    fn create_campaign(&self, title: String, description: String, target: u64) -> Result<String>;
    
    #[rpc(name = "donateToCampaign")]
    fn donate_to_campaign(&self, campaign_id: String, amount: u64) -> Result<()>;
}

pub struct RpcImpl {
    service: Service,
}

impl Rpc for RpcImpl {
    fn get_campaigns(&self) -> Result<Vec<Campaign>> {
        self.service.get_campaigns()
    }

    fn create_campaign(&self, title: String, description: String, target: u64) -> Result<String> {
        self.service.create_campaign(title, description, target)
    }

    fn donate_to_campaign(&self, campaign_id: String, amount: u64) -> Result<()> {
        self.service.donate_to_campaign(campaign_id, amount)
    }
}

pub fn create_rpc_handler(service: Service) -> IoHandler<()> {
    let mut io = IoHandler::new();
    let rpc_impl = RpcImpl { service };
    
    io.extend_with(rpc_impl.to_delegate());
    io
}