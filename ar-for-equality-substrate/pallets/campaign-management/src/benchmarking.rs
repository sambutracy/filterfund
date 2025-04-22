// filepath: ar-for-equality-substrate/ar-for-equality-substrate/pallets/campaign-management/src/benchmarking.rs
use frame_benchmarking::{benchmarks, whitelisted_caller};
use frame_system::RawOrigin;
use crate::{Pallet as CampaignManagement, Config, Campaign};

benchmarks! {
    create_campaign {
        let caller: T::AccountId = whitelisted_caller();
        let title = b"Test Campaign".to_vec();
        let description = b"Campaign Description".to_vec();
        let target = 1000u32.into();
        let deadline = 100u64.into();
    }: _(RawOrigin::Signed(caller.clone()), title, description, target, deadline)
    verify {
        // Verify that the campaign was created successfully
        assert_eq!(CampaignManagement::<T>::campaigns_count(), 1);
    }

    donate_to_campaign {
        let caller: T::AccountId = whitelisted_caller();
        let campaign_id = 1;
        let amount = 100u32.into();
        CampaignManagement::<T>::create_campaign(RawOrigin::Signed(caller.clone()).into(), b"Test Campaign".to_vec(), b"Campaign Description".to_vec(), 1000u32.into(), 100u64.into())?;
    }: _(RawOrigin::Signed(caller.clone()), campaign_id, amount)
    verify {
        // Verify that the donation was processed
        let campaign = CampaignManagement::<T>::campaigns(campaign_id).unwrap();
        assert_eq!(campaign.amount_collected, amount);
    }
}