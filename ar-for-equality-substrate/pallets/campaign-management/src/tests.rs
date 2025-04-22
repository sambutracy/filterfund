// filepath: ar-for-equality-substrate/pallets/campaign-management/src/tests.rs
use super::*;
use frame_support::{assert_ok, assert_noop};
use mock::{new_test_ext, Test};

#[test]
fn test_create_campaign() {
    new_test_ext().execute_with(|| {
        // Arrange
        let campaign_title = b"Campaign Title".to_vec();
        let campaign_description = b"Campaign Description".to_vec();
        let target_amount = 1000;
        let creator = 1;

        // Act
        assert_ok!(CampaignManagement::create_campaign(
            Origin::signed(creator),
            campaign_title.clone(),
            campaign_description.clone(),
            target_amount
        ));

        // Assert
        let campaign = CampaignManagement::campaigns(0).unwrap();
        assert_eq!(campaign.title, campaign_title);
        assert_eq!(campaign.description, campaign_description);
        assert_eq!(campaign.target, target_amount);
        assert_eq!(campaign.creator, creator);
    });
}

#[test]
fn test_donate_to_campaign() {
    new_test_ext().execute_with(|| {
        // Arrange
        let campaign_title = b"Campaign Title".to_vec();
        let campaign_description = b"Campaign Description".to_vec();
        let target_amount = 1000;
        let creator = 1;
        let donor = 2;
        let donation_amount = 100;

        // Create a campaign first
        assert_ok!(CampaignManagement::create_campaign(
            Origin::signed(creator),
            campaign_title.clone(),
            campaign_description.clone(),
            target_amount
        ));

        // Act
        assert_ok!(CampaignManagement::donate_to_campaign(
            Origin::signed(donor),
            0,
            donation_amount
        ));

        // Assert
        let campaign = CampaignManagement::campaigns(0).unwrap();
        assert_eq!(campaign.amount_collected, donation_amount);
    });
}

#[test]
fn test_donate_to_nonexistent_campaign() {
    new_test_ext().execute_with(|| {
        // Arrange
        let donor = 2;
        let donation_amount = 100;

        // Act & Assert
        assert_noop!(
            CampaignManagement::donate_to_campaign(Origin::signed(donor), 0, donation_amount),
            Error::<Test>::CampaignNotFound
        );
    });
}