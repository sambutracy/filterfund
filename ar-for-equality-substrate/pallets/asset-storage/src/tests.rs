// filepath: c:\Users\Victor Sambu\ar-for-equality-substrate\pallets\asset-storage\src\tests.rs
use super::*;
use frame_support::{assert_ok, assert_noop};
use mock::{new_test_ext, Test};

#[test]
fn test_store_asset() {
    new_test_ext().execute_with(|| {
        let asset_id = 1;
        let asset_data = vec![1, 2, 3, 4];

        // Test storing an asset
        assert_ok!(AssetStorage::store_asset(Origin::signed(1), asset_id, asset_data.clone()));
        assert_eq!(AssetStorage::assets(asset_id), Some(asset_data));
    });
}

#[test]
fn test_store_asset_already_exists() {
    new_test_ext().execute_with(|| {
        let asset_id = 1;
        let asset_data = vec![1, 2, 3, 4];

        // Store the asset first
        assert_ok!(AssetStorage::store_asset(Origin::signed(1), asset_id, asset_data.clone()));

        // Test storing the same asset again
        assert_noop!(
            AssetStorage::store_asset(Origin::signed(1), asset_id, asset_data),
            Error::<Test>::AssetAlreadyExists
        );
    });
}

#[test]
fn test_remove_asset() {
    new_test_ext().execute_with(|| {
        let asset_id = 1;
        let asset_data = vec![1, 2, 3, 4];

        // Store the asset first
        assert_ok!(AssetStorage::store_asset(Origin::signed(1), asset_id, asset_data.clone()));

        // Test removing the asset
        assert_ok!(AssetStorage::remove_asset(Origin::signed(1), asset_id));
        assert_eq!(AssetStorage::assets(asset_id), None);
    });
}

#[test]
fn test_remove_nonexistent_asset() {
    new_test_ext().execute_with(|| {
        let asset_id = 1;

        // Test removing a nonexistent asset
        assert_noop!(
            AssetStorage::remove_asset(Origin::signed(1), asset_id),
            Error::<Test>::AssetNotFound
        );
    });
}