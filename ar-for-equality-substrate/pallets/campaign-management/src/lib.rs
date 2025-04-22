// filepath: ar-for-equality-substrate/ar-for-equality-substrate/pallets/campaign-management/src/lib.rs

#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

#[frame_support::pallet]
pub mod pallet {
    use frame_support::{pallet_prelude::*, dispatch::DispatchResult};
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
    #[pallet::getter(fn campaigns)]
    pub type Campaigns<T> = StorageMap<_, Blake2_128Concat, u32, Campaign<T>, OptionQuery>;

    #[pallet::storage]
    #[pallet::getter(fn campaign_count)]
    pub type CampaignCount<T> = StorageValue<_, u32, ValueQuery>;

    #[derive(Clone, Encode, Decode, Default, RuntimeDebug, PartialEq, Eq)]
    pub struct Campaign<T: Config> {
        pub title: Vec<u8>,
        pub description: Vec<u8>,
        pub target: u32,
        pub amount_collected: u32,
        pub deadline: T::BlockNumber,
        pub creator: T::AccountId,
    }

    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        CampaignCreated(u32, T::AccountId),
        CampaignFunded(u32, T::AccountId, u32),
    }

    #[pallet::error]
    pub enum Error<T> {
        CampaignNotFound,
        NotCampaignCreator,
        DeadlinePassed,
        InsufficientFunds,
    }

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        #[pallet::weight(10_000)]
        pub fn create_campaign(
            origin: OriginFor<T>,
            title: Vec<u8>,
            description: Vec<u8>,
            target: u32,
            deadline: T::BlockNumber,
        ) -> DispatchResult {
            let creator = ensure_signed(origin)?;

            let campaign_id = CampaignCount::<T>::get();
            let new_campaign = Campaign {
                title,
                description,
                target,
                amount_collected: 0,
                deadline,
                creator: creator.clone(),
            };

            Campaigns::<T>::insert(campaign_id, new_campaign);
            CampaignCount::<T>::put(campaign_id + 1);

            Self::deposit_event(Event::CampaignCreated(campaign_id, creator));
            Ok(())
        }

        #[pallet::weight(10_000)]
        pub fn fund_campaign(
            origin: OriginFor<T>,
            campaign_id: u32,
            amount: u32,
        ) -> DispatchResult {
            let funder = ensure_signed(origin)?;

            let mut campaign = Campaigns::<T>::get(campaign_id).ok_or(Error::<T>::CampaignNotFound)?;

            ensure!(campaign.deadline > frame_system::Pallet::<T>::block_number(), Error::<T>::DeadlinePassed);
            campaign.amount_collected += amount;

            Campaigns::<T>::insert(campaign_id, campaign);
            Self::deposit_event(Event::CampaignFunded(campaign_id, funder, amount));
            Ok(())
        }
    }
}