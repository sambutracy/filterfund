// filepath: c:\Users\Victor Sambu\ar-for-equality-substrate\pallets\user-profiles\src\tests.rs
use crate::{mock::*, *};
use frame_support::{assert_ok, assert_noop};
use sp_core::H256;
use sp_runtime::traits::BadOrigin;

#[test]
fn test_create_user_profile() {
    new_test_ext().execute_with(|| {
        let user_id = 1;
        let user_name = b"Test User".to_vec();
        
        // Ensure the user profile can be created successfully
        assert_ok!(UserProfiles::create_user_profile(Origin::signed(user_id), user_name.clone()));
        
        // Verify that the user profile was created
        let profile = UserProfiles::user_profiles(user_id).unwrap();
        assert_eq!(profile.name, user_name);
    });
}

#[test]
fn test_create_user_profile_duplicate() {
    new_test_ext().execute_with(|| {
        let user_id = 1;
        let user_name = b"Test User".to_vec();
        
        // Create the user profile first
        assert_ok!(UserProfiles::create_user_profile(Origin::signed(user_id), user_name.clone()));
        
        // Attempt to create the same user profile again
        assert_noop!(
            UserProfiles::create_user_profile(Origin::signed(user_id), user_name.clone()),
            Error::<Test>::ProfileAlreadyExists
        );
    });
}

#[test]
fn test_update_user_profile() {
    new_test_ext().execute_with(|| {
        let user_id = 1;
        let user_name = b"Test User".to_vec();
        let new_user_name = b"Updated User".to_vec();
        
        // Create the user profile
        assert_ok!(UserProfiles::create_user_profile(Origin::signed(user_id), user_name.clone()));
        
        // Update the user profile
        assert_ok!(UserProfiles::update_user_profile(Origin::signed(user_id), new_user_name.clone()));
        
        // Verify that the user profile was updated
        let profile = UserProfiles::user_profiles(user_id).unwrap();
        assert_eq!(profile.name, new_user_name);
    });
}

#[test]
fn test_delete_user_profile() {
    new_test_ext().execute_with(|| {
        let user_id = 1;
        let user_name = b"Test User".to_vec();
        
        // Create the user profile
        assert_ok!(UserProfiles::create_user_profile(Origin::signed(user_id), user_name.clone()));
        
        // Delete the user profile
        assert_ok!(UserProfiles::delete_user_profile(Origin::signed(user_id)));
        
        // Verify that the user profile no longer exists
        assert!(UserProfiles::user_profiles(user_id).is_none());
    });
}