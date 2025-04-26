#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod filterfundnew {
    // In ink! 5.x we use this import pattern
    use ink::prelude::string::String;
    use ink::prelude::vec::Vec;
    use ink::storage::Mapping;
    
    // Copy your Filter struct here (unchanged)
    #[derive(Debug, scale::Encode, scale::Decode, Clone, PartialEq)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub struct Filter {
        platform: String,
        filter_type: String,
        instructions: String,
        filter_url: String,
    }
    
    // Copy your Campaign struct here (unchanged)
    #[derive(Debug, scale::Encode, scale::Decode, Clone, PartialEq)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
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
    
    // Copy your Error enum here (unchanged)
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    #[allow(clippy::cast_possible_truncation)]
    pub enum Error {
        CampaignNotFound,
        CampaignExpired,
        DeadlineTooSoon,
        NotEnoughBalance,
        TransferFailed,
        Unauthorized,
    }
    
    // Replace the template's Filterfundnew struct with your storage struct
    #[ink(storage)]
    pub struct Filterfundnew {
        campaigns: Mapping<u32, Campaign>,
        campaign_count: u32,
        owner: AccountId,
    }
    
    impl Filterfundnew {
        // Update your constructor - note the name change to match the new struct name
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                campaigns: Mapping::default(),
                campaign_count: 0,
                owner: Self::env().caller(),
            }
        }
        
        // Add a default constructor (new in ink! 5.x)
        #[ink(constructor)]
        pub fn default() -> Self {
            Self::new()
        }
        
        // Copy your create_campaign function (unchanged except for correct self type)
        #[ink(message)]
        #[allow(clippy::too_many_arguments)]
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
            if deadline <= current_time.saturating_add(86_400_000) { // At least 1 day in the future
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
            self.campaign_count = self.campaign_count.saturating_add(1);
            
            Ok(campaign_id)
        }
        
        // Copy your donate_to_campaign function (unchanged except for correct self type)
        #[ink(message, payable)]
        pub fn donate_to_campaign(&mut self, campaign_id: u32) -> Result<(), Error> {
            let donation = self.env().transferred_value();
            let _caller = self.env().caller();
            let current_time = self.env().block_timestamp();
            
            let campaign = match self.campaigns.get(campaign_id) {
                Some(c) => c,
                None => return Err(Error::CampaignNotFound),
            };
            
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
            let mut updated_campaign = campaign;
            updated_campaign.amount_collected = updated_campaign.amount_collected.saturating_add(donation);
            self.campaigns.insert(campaign_id, &updated_campaign);
            
            Ok(())
        }
        
        // Copy your get_campaign function (unchanged except for correct self type)
        #[ink(message)]
        pub fn get_campaign(&self, campaign_id: u32) -> Option<Campaign> {
            self.campaigns.get(campaign_id)
        }
        
        // Copy your get_all_campaigns function (unchanged except for correct self type)
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

    // You can keep the test modules from the template if you want,
    // but you'll need to update them to match your functions
    #[cfg(test)]
    mod tests {
        use super::*;
        use ink::env::{test::*, DefaultEnvironment};

        // Helper to create a test filter
        fn create_test_filter() -> Filter {
            Filter {
                platform: String::from("Instagram"),
                filter_type: String::from("Face"),
                instructions: String::from("Test instructions"),
                filter_url: String::from("https://example.com/filter"),
            }
        }

        // Helper to create a future timestamp (current time + days in ms)
        fn future_timestamp(days_from_now: u64) -> Timestamp {
            let current_time = ink::env::block_timestamp::<DefaultEnvironment>();
            current_time.saturating_add(days_from_now * 24 * 60 * 60 * 1000)
        }

        #[ink::test]
        fn default_works() {
            let contract = Filterfundnew::default();
            assert_eq!(contract.campaign_count, 0);
        }

        #[ink::test]
        fn create_campaign_works() {
            // Setup the contract
            let mut contract = Filterfundnew::default();
            
            // Create a campaign
            let result = contract.create_campaign(
                String::from("Test Campaign"),
                String::from("Test Description"),
                String::from("main_image.jpg"),
                String::from("filter_image.jpg"),
                String::from("Education"),
                1000,
                future_timestamp(10), // 10 days in the future
                create_test_filter(),
                String::from("Test Creator"),
            );
            
            // Assert campaign was created successfully
            assert!(result.is_ok());
            assert_eq!(result.unwrap(), 0);
            
            // Check that campaign exists and has correct data
            let campaign = contract.get_campaign(0).unwrap();
            assert_eq!(campaign.title, String::from("Test Campaign"));
            assert_eq!(campaign.amount_collected, 0);
            assert_eq!(campaign.id, 0);
            assert_eq!(campaign.is_active, true);
        }

        #[ink::test]
        fn create_campaign_deadline_too_soon_fails() {
            let mut contract = Filterfundnew::default();
            
            // Try to create a campaign with deadline too soon
            let result = contract.create_campaign(
                String::from("Failed Campaign"),
                String::from("Test Description"),
                String::from("main_image.jpg"),
                String::from("filter_image.jpg"),
                String::from("Education"),
                1000,
                ink::env::block_timestamp::<DefaultEnvironment>(), // Current time (too soon)
                create_test_filter(),
                String::from("Test Creator"),
            );
            
            // Should fail with DeadlineTooSoon error
            assert!(result.is_err());
            assert_eq!(result.unwrap_err(), Error::DeadlineTooSoon);
        }

        #[ink::test]
        fn get_all_campaigns_works() {
            let mut contract = Filterfundnew::default();
            
            // Create two campaigns
            let _ = contract.create_campaign(
                String::from("Campaign 1"),
                String::from("Description 1"),
                String::from("main1.jpg"),
                String::from("filter1.jpg"),
                String::from("Education"),
                1000,
                future_timestamp(10),
                create_test_filter(),
                String::from("Creator 1"),
            );
            
            let _ = contract.create_campaign(
                String::from("Campaign 2"),
                String::from("Description 2"),
                String::from("main2.jpg"),
                String::from("filter2.jpg"),
                String::from("Health"),
                2000,
                future_timestamp(20),
                create_test_filter(),
                String::from("Creator 2"),
            );
            
            // Get all campaigns
            let campaigns = contract.get_all_campaigns();
            
            // Check we got both campaigns
            assert_eq!(campaigns.len(), 2);
            assert_eq!(campaigns[0].title, String::from("Campaign 1"));
            assert_eq!(campaigns[1].title, String::from("Campaign 2"));
        }

        #[ink::test]
        fn donate_to_campaign_works() {
            // Setup accounts for testing
            let accounts = default_accounts::<DefaultEnvironment>();
            
            // Set the caller to be the first account
            set_caller::<DefaultEnvironment>(accounts.alice);
            
            let mut contract = Filterfundnew::default();
            
            // Create a campaign
            let campaign_id = contract.create_campaign(
                String::from("Donation Campaign"),
                String::from("Please donate"),
                String::from("main.jpg"),
                String::from("filter.jpg"),
                String::from("Charity"),
                10000,
                future_timestamp(30),
                create_test_filter(),
                String::from("Campaign Owner"),
            ).unwrap();
            
            // Switch to Bob who will make a donation
            set_caller::<DefaultEnvironment>(accounts.bob);
            
            // Set up Bob's balance
            ink::env::test::set_account_balance::<DefaultEnvironment>(accounts.bob, 1000000);
            
            // Set the transferred value for the donation
            set_value_transferred::<DefaultEnvironment>(500);
            
            // Make a donation
            let result = contract.donate_to_campaign(campaign_id);
            assert!(result.is_ok());
            
            // Check the campaign's collected amount was updated
            let campaign = contract.get_campaign(campaign_id).unwrap();
            assert_eq!(campaign.amount_collected, 500);
        }

        #[ink::test]
        fn donate_to_nonexistent_campaign_fails() {
            let accounts = default_accounts::<DefaultEnvironment>();
            set_caller::<DefaultEnvironment>(accounts.alice);
            ink::env::test::set_account_balance::<DefaultEnvironment>(accounts.alice, 1000000);
            set_value_transferred::<DefaultEnvironment>(500);
            
            let mut contract = Filterfundnew::default();
            
            // Try to donate to a campaign that doesn't exist
            let result = contract.donate_to_campaign(999);
            
            // Should fail with CampaignNotFound error
            assert!(result.is_err());
            assert_eq!(result.unwrap_err(), Error::CampaignNotFound);
        }

        #[ink::test]
        fn donate_to_expired_campaign_fails() {
            let accounts = default_accounts::<DefaultEnvironment>();
            set_caller::<DefaultEnvironment>(accounts.alice);
            
            let mut contract = Filterfundnew::default();
            
            // Create a campaign
            let campaign_id = contract.create_campaign(
                String::from("Expiring Campaign"),
                String::from("Will expire"),
                String::from("main.jpg"),
                String::from("filter.jpg"),
                String::from("Charity"),
                10000,
                future_timestamp(30),
                create_test_filter(),
                String::from("Campaign Owner"),
            ).unwrap();
            
            // Advance the block timestamp to after the deadline
            advance_block::<DefaultEnvironment>();
            set_block_timestamp::<DefaultEnvironment>(future_timestamp(40));
            
            // Try to donate
            set_caller::<DefaultEnvironment>(accounts.bob);
            ink::env::test::set_account_balance::<DefaultEnvironment>(accounts.bob, 1000000);
            set_value_transferred::<DefaultEnvironment>(500);
            
            let result = contract.donate_to_campaign(campaign_id);
            
            // Should fail with CampaignExpired error
            assert!(result.is_err());
            assert_eq!(result.unwrap_err(), Error::CampaignExpired);
        }
    }
}
