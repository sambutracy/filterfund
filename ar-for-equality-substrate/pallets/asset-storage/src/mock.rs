// filepath: c:\Users\Victor Sambu\ar-for-equality-substrate\pallets\asset-storage\src\mock.rs
use super::*;
use frame_support::{impl_outer_origin, assert_ok, assert_noop};
use sp_core::H256;
use frame_system::RawOrigin;

impl_outer_origin! {
    pub enum Origin for Test {}
}

#[derive(Clone, Default)]
pub struct Test;

impl frame_system::Config for Test {
    type BaseCallFilter = ();
    type Origin = Origin;
    type Index = u32;
    type BlockNumber = u32;
    type Hash = H256;
    type Hashing = sp_core::hashing::BlakeTwo256;
    type AccountId = u32;
    type Lookup = IdentityLookup<Self::AccountId>;
    type Header = frame_system::Header<Self::BlockNumber, Self::Hash>;
    type Event = ();
    type BlockHashCount = frame_support::traits::ConstU32<250>;
    type Version = ();
    type PalletInfo = ();
    type AccountData = ();
    type OnNewAccount = ();
    type OnKilledAccount = ();
    type WeightInfo = ();
}

pub type AssetStorage = Pallet<Test>;

pub fn new_test_ext() -> sp_io::TestExternalities {
    let mut storage = frame_system::GenesisConfig::default().build_storage::<Test>().unwrap();
    let _ = AssetStorage::init_storage(&mut storage);
    sp_io::TestExternalities::new(storage)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_stores_assets() {
        new_test_ext().execute_with(|| {
            // Test asset storage functionality here
        });
    }
}