// canisters/filter/types.mo
import Principal "mo:base/Principal";
import Time "mo:base/Time";

module {
    public type FilterId = Text;

    public type FilterDetails = {
        platform: Text;
        filterUrl: Text;
        previewImage: Text;
        filterType: Text;
        instructions: Text;
    };

    public type DemographicData = {
        ageRanges: [Text];
        locations: [Text];
        platforms: [Text];
    };

    public type FilterStats = {
        totalUses: Nat;
        uniqueUsers: Nat;
        shareCount: Nat;
        impressions: Nat;
        avgEngagementTime: Nat;
        peakUsageTime: Int;
        demographicData: DemographicData;
    };

    public type VerificationStatus = {
        #NotSubmitted;
        #Pending;
        #Verified;
        #Rejected;
    };
}