// filepath: ar-for-equality-substrate/ar-for-equality-substrate/runtime/src/lib.rs
#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet_campaign_management::Config as CampaignManagementConfig;
pub use pallet_user_profiles::Config as UserProfilesConfig;
pub use pallet_asset_storage::Config as AssetStorageConfig;

#[frame_support::pallet]
pub mod pallet_campaign_management {
    use frame_support::{pallet_prelude::*, traits::Currency};
    use frame_system::pallet_prelude::*;

    #[pallet::pallet]
    pub struct Pallet<T>(_);

    #[pallet::config]
    pub trait Config: frame_system::Config {
        type Currency: Currency<Self::AccountId>;
    }

    #[pallet::storage]
    #[pallet::getter(fn campaigns)]
    pub type Campaigns<T> = StorageMap<_, Blake2_128Concat, T::Hash, Campaign<T>>;

    #[pallet::event]
    #[pallet::generate_store(pub(super) trait Store)]
    pub mod event {
        use super::*;
        #[pallet::metadata(T::Hash = "Hash")]
        pub enum Event<T: Config> {
            CampaignCreated(T::Hash),
            CampaignFunded(T::Hash, T::Balance),
        }
    }

    #[pallet::dispatchable]
    impl<T: Config> Pallet<T> {
        #[pallet::weight(10_000)]
        pub fn create_campaign(origin: OriginFor<T>, title: Vec<u8>, target: T::Balance) -> DispatchResult {
            let who = ensure_signed(origin)?;
            let campaign_id = T::Hash::from([0u8; 32]); // Placeholder for actual ID generation
            let campaign = Campaign { title, target, amount_collected: 0.into(), creator: who.clone() };

            Campaigns::<T>::insert(campaign_id, campaign);
            Self::deposit_event(Event::CampaignCreated(campaign_id));
            Ok(())
        }

        #[pallet::weight(10_000)]
        pub fn fund_campaign(origin: OriginFor<T>, campaign_id: T::Hash, amount: T::Balance) -> DispatchResult {
            let who = ensure_signed(origin)?;
            let mut campaign = Campaigns::<T>::get(campaign_id).ok_or(Error::<T>::CampaignNotFound)?;

            campaign.amount_collected += amount;
            Campaigns::<T>::insert(campaign_id, campaign);
            Self::deposit_event(Event::CampaignFunded(campaign_id, amount));
            Ok(())
        }
    }

    #[derive(Clone, Encode, Decode, Default, RuntimeDebug, PartialEq, Eq)]
    pub struct Campaign<T: Config> {
        pub title: Vec<u8>,
        pub target: T::Balance,
        pub amount_collected: T::Balance,
        pub creator: T::AccountId,
    }
}

#[frame_support::pallet]
pub mod pallet_user_profiles {
    // Implementation for user profiles pallet
}

#[frame_support::pallet]
pub mod pallet_asset_storage {
    // Implementation for asset storage pallet
}