#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod filter_fund {
    use ink_storage::{traits::SpreadAllocate, Mapping};
    use ink_prelude::string::String;
    use ink_prelude::vec::Vec;
    
    #[derive(Debug, scale::Encode, scale::Decode, Clone, SpreadAllocate)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink_storage::traits::StorageLayout))]
    pub struct Filter {
        platform: String,
        filter_type: String,
        instructions: String,
        filter_url: String,
    }
    
    #[derive(Debug, scale::Encode, scale::Decode, Clone, SpreadAllocate)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink_storage::traits::StorageLayout))]
    pub struct Campaign {
        id: u32,
        creator: AccountId,
        creator_name: String,
        title: String,
        description: String,
        main_image: String,
        filter_image: String,
        category: String,
        target: Balance,
        amount_collected: Balance,
        deadline: Timestamp,
        is_active: bool,
        filter: Filter,
    }
    
    #[ink(storage)]
    #[derive(SpreadAllocate)]
    pub struct FilterFund {
        campaigns: Mapping<u32, Campaign>,
        campaign_count: u32,
        owner: AccountId,
    }
    
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        CampaignNotFound,
        CampaignExpired,
        DeadlineTooSoon,
        NotEnoughBalance,
        TransferFailed,
        Unauthorized,
    }
    
    impl FilterFund {
        #[ink(constructor)]
        pub fn new() -> Self {
            ink_lang::utils::initialize_contract(|contract| {
                let caller = Self::env().caller();
                contract.campaigns = Mapping::default();
                contract.campaign_count = 0;
                contract.owner = caller;
            })
        }
        
        #[ink(message)]
        pub fn create_campaign(
            &mut self,
            title: String,
            description: String,
            main_image: String,
            filter_image: String,
            category: String,
            target: Balance,
            deadline: Timestamp,
            filter: Filter,
            creator_name: String,
        ) -> Result<u32, Error> {
            let caller = self.env().caller();
            let current_time = self.env().block_timestamp();
            
            // Ensure deadline is in the future
            if deadline <= current_time + 86_400_000 { // At least 1 day in the future
                return Err(Error::DeadlineTooSoon);
            }
            
            let campaign_id = self.campaign_count;
            
            let campaign = Campaign {
                id: campaign_id,
                creator: caller,
                creator_name,
                title,
                description,
                main_image,
                filter_image,
                category,
                target,
                amount_collected: 0,
                deadline,
                is_active: true,
                filter,
            };
            
            self.campaigns.insert(campaign_id, &campaign);
            self.campaign_count += 1;
            
            Ok(campaign_id)
        }
        
        #[ink(message, payable)]
        pub fn donate_to_campaign(&mut self, campaign_id: u32) -> Result<(), Error> {
            let donation = self.env().transferred_value();
            let caller = self.env().caller();
            let current_time = self.env().block_timestamp();
            
            let mut campaign = self.campaigns.get(campaign_id).ok_or(Error::CampaignNotFound)?;
            
            if current_time > campaign.deadline {
                return Err(Error::CampaignExpired);
            }
            
            if !campaign.is_active {
                return Err(Error::CampaignExpired);
            }
            
            // Transfer funds to campaign creator
            if self.env().transfer(campaign.creator, donation).is_err() {
                return Err(Error::TransferFailed);
            }
            
            // Update campaign info
            campaign.amount_collected += donation;
            self.campaigns.insert(campaign_id, &campaign);
            
            Ok(())
        }
        
        #[ink(message)]
        pub fn get_campaign(&self, campaign_id: u32) -> Option<Campaign> {
            self.campaigns.get(campaign_id)
        }
        
        #[ink(message)]
        pub fn get_all_campaigns(&self) -> Vec<Campaign> {
            let mut result = Vec::new();
            
            for i in 0..self.campaign_count {
                if let Some(campaign) = self.campaigns.get(i) {
                    result.push(campaign);
                }
            }
            
            result
        }
    }
}