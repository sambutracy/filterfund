import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import CampaignCanister "main"; // Import the main canister
import Types "types";

actor TestCampaignCanister {
    private let campaignCanister = CampaignCanister;

    public func testCreateCampaign() : async () {
        let creator = Principal.fromText("your_test_principal_id"); // Replace with a test principal
        let result = await campaignCanister.createCampaign(
            "Test Campaign",
            "This is a test campaign.",
            1000000, // Target amount
            Time.now() + 86400, // Deadline: 1 day from now
            "https://example.com/image.png",
            "Test Creator",
            #Health, // Category
            {
                platform = "snapchat";
                filterUrl = "https://example.com/filter";
                previewImage = "https://example.com/preview.png";
                filterType = "face";
                instructions = "Use this filter to...";
            },
            {
                peopleImpacted = 0;
                locationsCovered = [];
                itemsToDeliver = 0;
                successMetric = "N/A";
            },
            {
                creatorPortfolio = null;
                campaignInstagram = null;
                campaignTwitter = null;
                additionalLinks = [];
            }
        );

        switch (result) {
            case (#ok(campaignId)) {
                Debug.print("Campaign created with ID: " # Nat.toText(campaignId));
            };
            case (#err(error)) {
                Debug.print("Error creating campaign: " # error);
            };
        }
    };

    // Additional tests for other functionalities...
}; 