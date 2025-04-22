// filepath: c:\Users\Victor Sambu\ar-for-equality\ar-for-equality-substrate\pallets\asset-storage\src\lib.rs

#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

#[frame_support::pallet]
pub mod pallet {
    use frame_support::{pallet_prelude::*, traits::StorageMap};
    use frame_system::pallet_prelude::*;

    #[pallet::pallet]
    #[pallet::generate_store(pub(super) trait Store)]
    pub struct Pallet<T>(_);

    #[pallet::config]
    pub trait Config: frame_system::Config {
        type Event: From<Event<Self>> + IsType<<Self as frame_system::Config>::Event>;
    }

    #[pallet::storage]
    #[pallet::getter(fn get_asset)]
    pub type Assets<T: Config> = StorageMap<_, Blake2_128Concat, T::AccountId, Vec<u8>, OptionQuery>;

    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        AssetStored(T::AccountId, Vec<u8>),
    }

    #[pallet::error]
    pub enum Error<T> {
        AssetAlreadyExists,
        AssetNotFound,
    }

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        #[pallet::weight(10_000)]
        pub fn store_asset(origin: OriginFor<T>, asset: Vec<u8>) -> DispatchResult {
            let who = ensure_signed(origin)?;

            ensure!(!Assets::<T>::contains_key(&who), Error::<T>::AssetAlreadyExists);

            Assets::<T>::insert(&who, asset.clone());
            Self::deposit_event(Event::AssetStored(who, asset));

            Ok(())
        }
    }
}