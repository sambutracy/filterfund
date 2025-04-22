// filepath: c:\Users\Victor Sambu\ar-for-equality-substrate\pallets\campaign-management\src\mock.rs
use frame_support::{parameter_types, traits::{OnInitialize, OnFinalize}};
use frame_system::Config as SystemConfig;
use sp_core::H256;
use sp_runtime::{testing::Header, traits::{BlakeTwo256, IdentityLookup}};
use crate::{Config, Campaign};

type UncheckedExtrinsic = frame_executive::UncheckedExtrinsic;
type Block = frame_executive::Block;

parameter_types! {
    pub const BlockHashCount: u64 = 250;
    pub const MaximumCampaigns: u32 = 100;
}

impl SystemConfig for Test {
    type BaseCallFilter = ();
    type BlockHashCount = BlockHashCount;
    type DbWeight = ();
    type Origin = Origin;
    type Index = u32;
    type BlockNumber = u64;
    type Hash = H256;
    type Hashing = BlakeTwo256;
    type AccountId = u64;
    type Lookup = IdentityLookup<u64>;
    type Header = Header;
    type Event = Event;
    type Block = Block;
    type Extrinsic = UncheckedExtrinsic;
    type WeightInfo = ();
}

impl Config for Test {
    type Event = Event;
    type MaximumCampaigns = MaximumCampaigns;
}

pub struct Test;

impl OnInitialize<u64> for Test {
    fn on_initialize(_n: u64) {
        // Initialization logic for the test environment
    }
}

impl OnFinalize<u64> for Test {
    fn on_finalize(_n: u64) {
        // Finalization logic for the test environment
    }
}

pub fn new_test_ext() -> sp_io::TestExternalities {
    let mut t = frame_system::GenesisConfig::default().build_storage::<Test>().unwrap();
    t.into()
}