// filepath: c:\Users\Victor Sambu\ar-for-equality-substrate\pallets\user-profiles\src\mock.rs
use super::*;
use frame_support::{impl_outer_origin, assert_ok, assert_noop};
use sp_core::H256;
use frame_system::RawOrigin;

impl_outer_origin! {
    pub enum Origin for Test {}
}

#[derive(Clone, Eq, PartialEq)]
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
    type BlockHashCount = ();
    type Version = ();
    type PalletInfo = ();
    type AccountData = ();
    type OnNewAccount = ();
    type OnKilledAccount = ();
    type WeightInfo = ();
}

pub type UserProfiles = Pallet<Test>;

pub fn new_test_ext() -> sp_io::TestExternalities {
    let mut t = frame_system::GenesisConfig::default().build_storage::<Test>().unwrap();
    UserProfiles::GenesisConfig {
        users: vec![(1, "Alice".into()), (2, "Bob".into())],
    }
    .assimilate_storage(&mut t)
    .unwrap();
    t.into()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_user() {
        new_test_ext().execute_with(|| {
            assert_ok!(UserProfiles::create_user(RawOrigin::Signed(1).into(), "Alice".into()));
            assert_eq!(UserProfiles::users(1).unwrap().name, "Alice");
        });
    }

    #[test]
    fn test_create_user_duplicate() {
        new_test_ext().execute_with(|| {
            let _ = UserProfiles::create_user(RawOrigin::Signed(1).into(), "Alice".into());
            assert_noop!(UserProfiles::create_user(RawOrigin::Signed(1).into(), "Alice".into()), Error::<Test>::UserAlreadyExists);
        });
    }
}