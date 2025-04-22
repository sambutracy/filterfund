// filepath: ar-for-equality-substrate/ar-for-equality-substrate/node/src/chain_spec.rs

use sp_core::H256;
use sp_runtime::{traits::{BlakeTwo256, IdentityLookup}, Perbill};
use frame_support::{construct_runtime, parameter_types, traits::Everything};
use pallet_balances::Config as BalancesConfig;
use pallet_timestamp::Config as TimestampConfig;
use pallet_transaction_payment::Config as TransactionPaymentConfig;
use pallet_campaign_management::Config as CampaignManagementConfig;
use pallet_user_profiles::Config as UserProfilesConfig;
use pallet_asset_storage::Config as AssetStorageConfig;

type AccountId = u64;
type Index = u32;
type BlockNumber = u32;
type Balance = u128;

parameter_types! {
    pub const BlockHashCount: BlockNumber = 240;
    pub const MaximumBlockWeight: Weight = 2 * 1024 * 1024; // 2MB
    pub const Version: RuntimeVersion = RuntimeVersion::new(1, 0, 0);
}

construct_runtime! {
    pub enum Runtime where
        Block = Block,
        NodeBlock = NodeBlock,
        UncheckedExtrinsic = UncheckedExtrinsic,
    {
        System: frame_system::{Module, Call, Config, Storage, Event<T>},
        Timestamp: pallet_timestamp::{Module, Call, Storage, Event<T>},
        Balances: pallet_balances::{Module, Call, Storage, Event<T>, Config<T>},
        TransactionPayment: pallet_transaction_payment::{Module, Call, Storage},
        CampaignManagement: pallet_campaign_management::{Module, Call, Storage, Event<T>},
        UserProfiles: pallet_user_profiles::{Module, Call, Storage, Event<T>},
        AssetStorage: pallet_asset_storage::{Module, Call, Storage, Event<T>},
    }
}

pub fn chain_spec() -> ChainSpec<Runtime> {
    let mut properties = HashMap::new();
    properties.insert("tokenSymbol".into(), "AR".into());
    properties.insert("tokenDecimals".into(), 12.into());

    ChainSpec::from_genesis(
        "FilterFund AR",
        "filter_fund_ar",
        ChainType::Development,
        || {
            let initial_accounts = vec![
                // Add initial accounts here
            ];

            let mut balances = vec![];
            for account in initial_accounts.iter() {
                balances.push((account.clone(), 1_000_000_000_000_000_000u128)); // 1 million tokens
            }

            GenesisConfig {
                system: Some(SystemConfig {
                    code: WASM_BINARY.to_vec(),
                    changes_trie_config: Default::default(),
                }),
                balances: Some(BalancesConfig {
                    balances,
                }),
                timestamp: Some(TimestampConfig {
                    minimum_period: 5,
                }),
                transaction_payment: Some(TransactionPaymentConfig {
                    // Configure transaction payment settings
                }),
                campaign_management: Some(CampaignManagementConfig {
                    // Configure campaign management settings
                }),
                user_profiles: Some(UserProfilesConfig {
                    // Configure user profiles settings
                }),
                asset_storage: Some(AssetStorageConfig {
                    // Configure asset storage settings
                }),
            }
        },
        vec![],
        None,
        Some(properties),
        None,
    )
}