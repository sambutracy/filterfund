import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import FilterCanister "main"; // Import the main canister
import Types "types";

actor TestFilterCanister {
    private let filterCanister = FilterCanister;

    public func testUpdateFilterStats() : async () {
        let filterId = "test_filter_id"; // Replace with a test filter ID
        let stats = {
            totalUses = 10;
            uniqueUsers = 5;
            shareCount = 2;
            impressions = 100;
            avgEngagementTime = 30;
            peakUsageTime = 0; // Placeholder
            demographicData = {
                ageRanges = [];
                locations = [];
                platforms = [];
            };
        };

        let result = await filterCanister.updateFilterStats(filterId, stats);
        if (result) {
            Debug.print("Filter stats updated successfully.");
        } else {
            Debug.print("Failed to update filter stats.");
        }
    };

    // Additional tests for other functionalities...
}; 