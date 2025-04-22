// filepath: c:\Users\Victor Sambu\ar-for-equality-substrate\pallets\user-profiles\src\lib.rs
#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

#[frame_support::pallet]
pub mod pallet {
    use frame_support::{pallet_prelude::*, sp_runtime::traits::AccountIdConversion};
    use frame_system::pallet_prelude::*;
    use sp_std::vec::Vec;

    #[pallet::pallet]
    #[pallet::generate_store(pub(super) trait Store)]
    pub struct Pallet<T>(_);

    #[pallet::config]
    pub trait Config: frame_system::Config {
        type Event: From<Event<Self>> + IsType<<Self as frame_system::Config>::Event>;
    }

    #[pallet::storage]
    #[pallet::getter(fn user_profiles)]
    pub type UserProfiles<T: Config> = StorageMap<_, Blake2_128Concat, T::AccountId, UserProfile<T>, OptionQuery>;

    #[pallet::storage]
    #[pallet::getter(fn user_count)]
    pub type UserCount<T: Config> = StorageValue<_, u32, ValueQuery>;

    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        UserProfileCreated(T::AccountId),
        UserProfileUpdated(T::AccountId),
    }

    #[pallet::error]
    pub enum Error<T> {
        UserProfileAlreadyExists,
        UserProfileNotFound,
    }

    #[derive(Clone, Encode, Decode, Default, RuntimeDebug, PartialEq, Eq)]
    pub struct UserProfile<T: Config> {
        pub name: Vec<u8>,
        pub bio: Vec<u8>,
        pub avatar: Vec<u8>,
    }

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        #[pallet::weight(10_000)]
        pub fn create_user_profile(origin: OriginFor<T>, name: Vec<u8>, bio: Vec<u8>, avatar: Vec<u8>) -> DispatchResult {
            let who = ensure_signed(origin)?;

            ensure!(!UserProfiles::<T>::contains_key(&who), Error::<T>::UserProfileAlreadyExists);

            let profile = UserProfile { name, bio, avatar };
            UserProfiles::<T>::insert(&who, profile);
            UserCount::<T>::put(UserCount::<T>::get() + 1);

            Self::deposit_event(Event::UserProfileCreated(who));
            Ok(())
        }

        #[pallet::weight(10_000)]
        pub fn update_user_profile(origin: OriginFor<T>, name: Vec<u8>, bio: Vec<u8>, avatar: Vec<u8>) -> DispatchResult {
            let who = ensure_signed(origin)?;

            let mut profile = UserProfiles::<T>::get(&who).ok_or(Error::<T>::UserProfileNotFound)?;

            profile.name = name;
            profile.bio = bio;
            profile.avatar = avatar;

            UserProfiles::<T>::insert(&who, profile);
            Self::deposit_event(Event::UserProfileUpdated(who));
            Ok(())
        }
    }
}