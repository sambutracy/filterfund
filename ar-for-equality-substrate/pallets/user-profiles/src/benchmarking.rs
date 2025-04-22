// filepath: c:\Users\Victor Sambu\ar-for-equality-substrate\pallets\user-profiles\src\benchmarking.rs
#![cfg(test)]

use frame_benchmarking::{benchmarks, whitelisted_caller};
use frame_system::RawOrigin;
use sp_std::prelude::*;

use crate::{Pallet as UserProfiles, *};

benchmarks! {
    create_user {
        let caller: T::AccountId = whitelisted_caller();
        let user_id = 1;
        let user_data = vec![1u8; 32]; // Example user data
    }: _(RawOrigin::Signed(caller.clone()), user_id, user_data)
    verify {
        assert_eq!(UserProfiles::<T>::users(user_id).is_some(), true);
    }

    update_user {
        let caller: T::AccountId = whitelisted_caller();
        let user_id = 1;
        let user_data = vec![1u8; 32]; // Example user data
        UserProfiles::<T>::create_user(RawOrigin::Signed(caller.clone()).into(), user_id, user_data.clone()).unwrap();
    }: _(RawOrigin::Signed(caller.clone()), user_id, user_data)
    verify {
        assert_eq!(UserProfiles::<T>::users(user_id).unwrap().data, user_data);
    }

    delete_user {
        let caller: T::AccountId = whitelisted_caller();
        let user_id = 1;
        let user_data = vec![1u8; 32]; // Example user data
        UserProfiles::<T>::create_user(RawOrigin::Signed(caller.clone()).into(), user_id, user_data).unwrap();
    }: _(RawOrigin::Signed(caller.clone()), user_id)
    verify {
        assert_eq!(UserProfiles::<T>::users(user_id).is_none(), true);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::mock::{new_test_ext, Test};

    #[test]
    fn benchmark_create_user() {
        new_test_ext().execute_with(|| {
            // Benchmarking logic for create_user
        });
    }

    #[test]
    fn benchmark_update_user() {
        new_test_ext().execute_with(|| {
            // Benchmarking logic for update_user
        });
    }

    #[test]
    fn benchmark_delete_user() {
        new_test_ext().execute_with(|| {
            // Benchmarking logic for delete_user
        });
    }
}