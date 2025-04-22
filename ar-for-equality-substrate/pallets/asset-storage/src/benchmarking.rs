// filepath: c:\Users\Victor Sambu\ar-for-equality-substrate\pallets\asset-storage\src\benchmarking.rs
#![cfg(test)]

use frame_benchmarking::{benchmarks, whitelisted_caller};
use frame_system::RawOrigin;
use sp_std::prelude::*;

use crate::{Pallet as AssetStorage, *};

benchmarks! {
    create_asset {
        let caller: T::AccountId = whitelisted_caller();
        let asset_id = 1;
        let asset_data = vec![1u8; 1024]; // Example asset data

        // Precondition: Ensure the asset does not exist
        assert!(!AssetStorage::<T>::assets(asset_id).is_some());
    }: _(RawOrigin::Signed(caller.clone()), asset_id, asset_data)
    verify {
        // Postcondition: Ensure the asset exists
        assert!(AssetStorage::<T>::assets(asset_id).is_some());
    }

    delete_asset {
        let caller: T::AccountId = whitelisted_caller();
        let asset_id = 1;
        let asset_data = vec![1u8; 1024]; // Example asset data

        // Create an asset first
        AssetStorage::<T>::create_asset(RawOrigin::Signed(caller.clone()).into(), asset_id, asset_data).unwrap();
    }: _(RawOrigin::Signed(caller), asset_id)
    verify {
        // Postcondition: Ensure the asset does not exist
        assert!(!AssetStorage::<T>::assets(asset_id).is_some());
    }
}