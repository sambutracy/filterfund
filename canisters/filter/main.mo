// canisters/filter/main.mo
import Types "types";
import UserTypes "../user/types";
import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import CustomText "../utils/Text"; // Import the custom Text module

actor FilterCanister {
    type FilterStats = Types.FilterStats;
    type VerificationStatus = Types.VerificationStatus;
    type FilterId = Types.FilterId;

    private var filterStats = HashMap.HashMap<FilterId, FilterStats>(
        0, Text.equal, Text.hash
    );

    private var verificationStatus = HashMap.HashMap<FilterId, VerificationStatus>(
        0, Text.equal, Text.hash
    );

    // Reference to User Canister
    private stable var userCanister: Principal = Principal.fromText("your_user_canister_principal_id");

    // Update Filter Statistics
    public shared(msg) func updateFilterStats(
        filterId: FilterId, 
        stats: FilterStats
    ) : async Bool {
        // Only allow updates from authorized sources
        if (not isAuthorizedStatsProvider(msg.caller)) {
            return false;
        };
        
        filterStats.put(filterId, stats);
        true
    };

    // Get Filter Statistics
    public query func getFilterStats(filterId: FilterId) : async ?FilterStats {
        filterStats.get(filterId)
    };

    // Record Filter Use
    public shared(msg) func recordFilterUse(
        filterId: FilterId,
        duration: Nat,
        platform: Text,
        location: Text
    ) : async Bool {
        // Validate user existence
        let userProfileResult = await UserCanister.getUserProfile(msg.caller);
        
        switch (userProfileResult) {
            case (null) { return false }; // User not registered
            case (?profile) { 
                // User exists, proceed with recording filter use
                let currentStats = switch (filterStats.get(filterId)) {
                    case (null) { createInitialFilterStats() };
                    case (?stats) { stats };
                };
                
                let updatedStats = updateFilterStatistics(currentStats, duration, platform, location);
                filterStats.put(filterId, updatedStats);
                return true;
            };
        };
    };

    // Submit Filter for Verification
    public shared(msg) func submitForVerification(filterId: FilterId) : async Bool {
        if (not isFilterCreator(msg.caller, filterId)) {
            return false;
        };
        
        verificationStatus.put(filterId, #Pending);
        true
    };

    // Verify Filter
    public shared(msg) func verifyFilter(
        filterId: FilterId, 
        status: VerificationStatus,
        notes: ?Text
    ) : async Bool {
        if (not isAdmin(msg.caller)) {
            return false;
        };
        
        verificationStatus.put(filterId, status);
        
        // Emit verification event for tracking (placeholder)
        await emitVerificationEvent(filterId, status, notes);
        true
    };

    // Helper Functions
    private func isAuthorizedStatsProvider(principal: Principal) : Bool {
        // Implementation for checking authorized stats providers
        // For now, return true as a placeholder
        true
    };

    private func createInitialFilterStats() : FilterStats {
        {
            totalUses = 0;
            uniqueUsers = 0;
            shareCount = 0;
            impressions = 0;
            avgEngagementTime = 0;
            peakUsageTime = Time.now();
            demographicData = {
                ageRanges = [];
                locations = [];
                platforms = [];
            };
        }
    };

    private func updateFilterStatistics(
        currentStats: FilterStats,
        duration: Nat,
        platform: Text,
        location: Text
    ) : FilterStats {
        // Update statistics logic
        let newTotalUses = currentStats.totalUses + 1;
        let newAvgEngagementTime = (currentStats.avgEngagementTime * currentStats.totalUses + duration) / newTotalUses;
        
        // Update demographic data (placeholder logic)
        let updatedLocations = if (not Array.contains<Text>(currentStats.demographicData.locations, location, Text.equal)) {
            Array.append<Text>(currentStats.demographicData.locations, [location])
        } else {
            currentStats.demographicData.locations
        };
        
        let updatedPlatforms = if (not Array.contains<Text>(currentStats.demographicData.platforms, platform, Text.equal)) {
            Array.append<Text>(currentStats.demographicData.platforms, [platform])
        } else {
            currentStats.demographicData.platforms
        };
        
        {
            totalUses = newTotalUses;
            uniqueUsers = currentStats.uniqueUsers + 1; // Simplified assumption
            shareCount = currentStats.shareCount;
            impressions = currentStats.impressions;
            avgEngagementTime = newAvgEngagementTime;
            peakUsageTime = if (newTotalUses > currentStats.totalUses) { Time.now() } else { currentStats.peakUsageTime };
            demographicData = {
                ageRanges = currentStats.demographicData.ageRanges;
                locations = updatedLocations;
                platforms = updatedPlatforms;
            };
        }
    };

    private func isAdmin(principal: Principal) : Bool {
        // Implementation for checking admin status
        // For development, you might want to hardcode certain principals as admins
        false // Placeholder
    };

    private func isFilterCreator(principal: Principal, filterId: FilterId) : Bool {
        // Implementation for checking if the principal is the creator of the filter
        // This would typically check against stored filter creation data
        false // Placeholder
    };

    private func emitVerificationEvent(
        filterId: FilterId,
        status: VerificationStatus,
        notes: ?Text
    ) : async () {
        // Implementation for emitting verification events
        // This might log to a stable variable or call another canister
        // Placeholder implementation
    };
};