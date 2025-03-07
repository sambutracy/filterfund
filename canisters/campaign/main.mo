// canisters/campaign/main.mo
import Types "types";
import FilterTypes "../filter/types";
import UserTypes "../user/types";
import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Hash "mo:base/Hash";

actor CampaignCanister {
    type Campaign = Types.Campaign;
    type CampaignId = Types.CampaignId;
    type FilterDetails = FilterTypes.FilterDetails;
    type CauseCategory = Types.CauseCategory;
    type ImpactMetrics = Types.ImpactMetrics;
    type SocialLinks = Types.SocialLinks;
    type Donation = Types.Donation;

    private stable var nextCampaignId: Nat = 0;
    private var campaigns = HashMap.HashMap<CampaignId, Campaign>(
        0, Nat.equal, Hash.hash
    );

    // Reference to User Canister
    private stable var userCanister: Principal = Principal.fromText("your_user_canister_principal_id");

    // Campaign Creation
    public shared(msg) func createCampaign(
        title: Text,
        description: Text,
        target: Nat,
        deadline: Int,
        mainImage: Text,
        category: CauseCategory,
        filter: FilterDetails,
        impactMetrics: ImpactMetrics,
        socialLinks: SocialLinks
    ) : async Result.Result<CampaignId, Text> {
        let creator = msg.caller;

        // Validate user existence
        let userProfile = await UserCanister.getUserProfile(creator);
        
        // First check if user exists
        switch (userProfile) {
            case (null) return #err("User not registered");
            case (?profile) { /* User exists, continue */ };
        };
        
        // Then validate other inputs
        if (Text.size(title) == 0) return #err("Title cannot be empty");
        if (Text.size(description) == 0) return #err("Description cannot be empty");
        if (target == 0) return #err("Target amount must be greater than 0");
        if (deadline <= Time.now()) return #err("Deadline must be in the future");
        if (Text.size(filter.filterUrl) == 0) return #err("Filter URL is required");

        let campaign: Campaign = {
            id = nextCampaignId;
            creator = creator;
            creatorName = null;
            title = title;
            description = description;
            target = target;
            deadline = deadline;
            amountCollected = 0;
            mainImage = mainImage;
            category = category;
            filter = filter;
            impactMetrics = impactMetrics;
            donations = [];
            isActive = true;
            created = Time.now();
            socialLinks = socialLinks;
        };

        campaigns.put(nextCampaignId, campaign);
        nextCampaignId += 1;

        #ok(nextCampaignId - 1)
    };

    // Get Campaign Details
    public query func getCampaign(id: CampaignId) : async ?Campaign {
        campaigns.get(id)
    };

    // Get All Campaigns
    public query func getAllCampaigns() : async [Campaign] {
        Iter.toArray(campaigns.vals())
    };

    // Get User's Campaigns
    public shared(msg) func getMyCampaigns() : async [Campaign] {
        let userPrincipal = msg.caller;
        var userCampaigns: [Campaign] = [];
        
        for ((_, campaign) in campaigns.entries()) {
            if (Principal.equal(campaign.creator, userPrincipal)) {
                userCampaigns := Array.append(userCampaigns, [campaign]);
            };
        };
        
        userCampaigns
    };

    // Update Campaign Status
    public shared(msg) func updateCampaignStatus(id: CampaignId, isActive: Bool) : async Bool {
        switch (campaigns.get(id)) {
            case (null) return false;
            case (?campaign) {
                if (not Principal.equal(msg.caller, campaign.creator)) return false;

                let updatedCampaign = {
                    campaign with
                    isActive = isActive;
                };

                campaigns.put(id, updatedCampaign);
                true
            };
        }
    };

    // Donate to Campaign
    public shared(msg) func donateToCampaign(id: CampaignId, amount: Nat) : async Bool {
        switch (campaigns.get(id)) {
            case (null) return false;
            case (?campaign) {
                if (Time.now() > campaign.deadline or not campaign.isActive) {
                    return false;
                };

                let donation: Donation = {
                    donor = msg.caller;
                    amount = amount;
                    message = null;
                    timestamp = Time.now();
                    isAnonymous = false;
                };
                
                let updatedDonations = Array.append(campaign.donations, [donation]);

                let updatedCampaign = {
                    campaign with
                    donations = updatedDonations;
                    amountCollected = campaign.amountCollected + amount;
                };

                campaigns.put(id, updatedCampaign);
                true
            };
        }
    };

    // System Functions
    system func preupgrade() {
        // Handle state preservation if needed
    };

    system func postupgrade() {
        // Handle state recovery if needed
    };
};
