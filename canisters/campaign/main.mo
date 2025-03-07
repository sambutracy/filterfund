// Campaign Canister
import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import Float "mo:base/Float";
import Hash "mo:base/Hash";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";

actor CampaignCanister {
    // Type definitions
    public type CampaignId = Nat;
    public type UserId = Principal;
    
    public type CauseCategory = {
        #Health;
        #Education;
        #Environment;
        #Equality;
        #Poverty;
        #HumanRights;
        #AnimalWelfare;
        #Other;
    };

    public type FilterDetails = {
        platform: Text;
        filterUrl: Text;
        previewImage: Text; // Asset canister URL for filter preview image
        filterType: Text;
        instructions: Text;
    };

    public type Donation = {
        donor: Principal;
        amount: Nat;
        message: ?Text;
        timestamp: Int;
        isAnonymous: Bool;
    };

    public type Campaign = {
        id: CampaignId;
        creator: Principal;
        creatorName: Text;
        title: Text;
        description: Text;
        target: Nat;        // Funding target in tokens
        deadline: Int;      // Deadline as timestamp
        amountCollected: Nat;
        mainImage: Text;    // Asset canister URL for main campaign image
        filterImage: Text;  // Asset canister URL for QR code image
        category: CauseCategory;
        filter: FilterDetails;
        donations: [Donation];
        isActive: Bool;
        created: Int;       // Creation timestamp
    };

    public type CreateCampaignRequest = {
        title: Text;
        description: Text;
        target: Nat;
        deadline: Int;
        mainImage: Text;
        filterImage: Text;
        creatorName: Text;
        category: CauseCategory;
        filter: FilterDetails;
    };

    // State variables
    private stable var nextCampaignId: Nat = 0;
    private stable var campaignsEntries : [(CampaignId, Campaign)] = [];
    private stable var userCampaignsEntries : [(Principal, [CampaignId])] = [];
    
    private var campaigns = HashMap.HashMap<CampaignId, Campaign>(
        0, Nat.equal, Hash.hash
    );
    
    private var userCampaigns = HashMap.HashMap<Principal, [CampaignId]>(
        0, Principal.equal, Principal.hash
    );

    // Initialize state from stable variables on upgrade
    system func preupgrade() {
        campaignsEntries := Iter.toArray(campaigns.entries());
        userCampaignsEntries := Iter.toArray(userCampaigns.entries());
    };

    system func postupgrade() {
        campaigns := HashMap.fromIter<CampaignId, Campaign>(
            campaignsEntries.vals(), 10, Nat.equal, Hash.hash
        );
        userCampaigns := HashMap.fromIter<Principal, [CampaignId]>(
            userCampaignsEntries.vals(), 10, Principal.equal, Principal.hash
        );
    };

    // Helper functions
    private func addToUserCampaigns(userId: Principal, campaignId: CampaignId) {
        switch (userCampaigns.get(userId)) {
            case (null) {
                userCampaigns.put(userId, [campaignId]);
            };
            case (?campaigns) {
                userCampaigns.put(userId, Array.append(campaigns, [campaignId]));
            };
        };
    };

    private func validateCampaignRequest(request: CreateCampaignRequest) : Result.Result<(), Text> {
        if (Text.size(request.title) == 0) { return #err("Title cannot be empty") };
        if (Text.size(request.description) == 0) { return #err("Description cannot be empty") };
        if (request.target == 0) { return #err("Funding target must be greater than 0") };
        if (request.deadline <= Time.now()) { return #err("Deadline must be in the future") };
        if (Text.size(request.mainImage) == 0) { return #err("Main image URL is required") };
        if (Text.size(request.filterImage) == 0) { return #err("Filter QR code image URL is required") };
        if (Text.size(request.creatorName) == 0) { return #err("Creator name is required") };
        if (Text.size(request.filter.filterUrl) == 0) { return #err("Filter URL is required") };
        if (Text.size(request.filter.platform) == 0) { return #err("Filter platform is required") };
        
        #ok(());
    };

    // Public methods
    public shared(msg) func createCampaign(request: CreateCampaignRequest) : async Result.Result<CampaignId, Text> {
        let caller = msg.caller;
        
        // Validate user and inputs
        if (Principal.isAnonymous(caller)) {
            return #err("Anonymous principal not allowed");
        };
        
        let validationResult = validateCampaignRequest(request);
        switch (validationResult) {
            case (#err(message)) { return #err(message); };
            case (#ok()) { /* Continue */ };
        };

        let campaignId = nextCampaignId;
        
        let newCampaign: Campaign = {
            id = campaignId;
            creator = caller;
            creatorName = request.creatorName;
            title = request.title;
            description = request.description;
            target = request.target;
            deadline = request.deadline;
            amountCollected = 0;
            mainImage = request.mainImage;
            filterImage = request.filterImage;
            category = request.category;
            filter = request.filter;
            donations = [];
            isActive = true;
            created = Time.now();
        };

        campaigns.put(campaignId, newCampaign);
        addToUserCampaigns(caller, campaignId);
        
        nextCampaignId += 1;
        #ok(campaignId);
    };

    public query func getCampaign(id: CampaignId) : async ?Campaign {
        campaigns.get(id);
    };

    public query func getAllCampaigns() : async [Campaign] {
        Iter.toArray(campaigns.vals());
    };

    public query func getCampaignsByCategory(category: CauseCategory) : async [Campaign] {
        let filtered = Buffer.Buffer<Campaign>(0);
        for (campaign in campaigns.vals()) {
            if (campaign.category == category) {
                filtered.add(campaign);
            };
        };
        Buffer.toArray(filtered);
    };

    public query(msg) func getMyCampaigns() : async [Campaign] {
        let caller = msg.caller;
        let userCampaignIds = switch (userCampaigns.get(caller)) {
            case (null) { [] };
            case (?ids) { ids };
        };
        
        let result = Buffer.Buffer<Campaign>(0);
        for (id in userCampaignIds.vals()) {
            switch (campaigns.get(id)) {
                case (null) { /* Skip */ };
                case (?campaign) { result.add(campaign); };
            };
        };
        
        Buffer.toArray(result);
    };

    public shared(msg) func donateToCampaign(campaignId: CampaignId, amount: Nat, message: ?Text, isAnonymous: Bool) : async Result.Result<(), Text> {
        let caller = msg.caller;
        
        if (Principal.isAnonymous(caller)) {
            return #err("Anonymous principal not allowed");
        };
        
        if (amount == 0) {
            return #err("Donation amount must be greater than 0");
        };
        
        switch (campaigns.get(campaignId)) {
            case (null) { return #err("Campaign not found"); };
            case (?campaign) {
                if (not campaign.isActive) {
                    return #err("Campaign is not active");
                };
                
                if (campaign.deadline < Time.now()) {
                    return #err("Campaign has ended");
                };
                
                let donation: Donation = {
                    donor = caller;
                    amount = amount;
                    message = message;
                    timestamp = Time.now();
                    isAnonymous = isAnonymous;
                };
                
                let updatedDonations = Array.append(campaign.donations, [donation]);
                let updatedAmountCollected = campaign.amountCollected + amount;
                
                let updatedCampaign = {
                    campaign with
                    donations = updatedDonations;
                    amountCollected = updatedAmountCollected;
                };
                
                campaigns.put(campaignId, updatedCampaign);
                #ok(());
            };
        };
    };

    public shared(msg) func updateCampaignStatus(campaignId: CampaignId, isActive: Bool) : async Result.Result<(), Text> {
        let caller = msg.caller;
        
        switch (campaigns.get(campaignId)) {
            case (null) { return #err("Campaign not found"); };
            case (?campaign) {
                if (not Principal.equal(caller, campaign.creator)) {
                    return #err("Only the creator can update campaign status");
                };
                
                let updatedCampaign = {
                    campaign with
                    isActive = isActive;
                };
                
                campaigns.put(campaignId, updatedCampaign);
                #ok(());
            };
        };
    };

    // Query functions for statistics and reporting
    public query func getActiveCampaigns() : async [Campaign] {
        let filtered = Buffer.Buffer<Campaign>(0);
        for (campaign in campaigns.vals()) {
            if (campaign.isActive and campaign.deadline > Time.now()) {
                filtered.add(campaign);
            };
        };
        Buffer.toArray(filtered);
    };

    public query func getTopCampaigns(limit: Nat) : async [Campaign] {
        var allCampaigns = Iter.toArray(campaigns.vals());
        
        // Sort by amount collected (descending)
        allCampaigns := Array.sort(
            allCampaigns,
            func(a: Campaign, b: Campaign): Bool {
                a.amountCollected > b.amountCollected
            }
        );
        
        // Take only the specified limit
        if (allCampaigns.size() <= limit) {
            return allCampaigns;
        } else {
            return Array.subArray(allCampaigns, 0, limit);
        };
    };

    public query func getRecentCampaigns(limit: Nat) : async [Campaign] {
        var allCampaigns = Iter.toArray(campaigns.vals());
        
        // Sort by creation time (descending)
        allCampaigns := Array.sort(
            allCampaigns,
            func(a: Campaign, b: Campaign): Bool {
                a.created > b.created
            }
        );
        
        // Take only the specified limit
        if (allCampaigns.size() <= limit) {
            return allCampaigns;
        } else {
            return Array.subArray(allCampaigns, 0, limit);
        };
    };

    public query func getCampaignDonors(campaignId: CampaignId) : async [Principal] {
        switch (campaigns.get(campaignId)) {
            case (null) { [] };
            case (?campaign) {
                let donors = Buffer.Buffer<Principal>(0);
                for (donation in campaign.donations.vals()) {
                    if (not donation.isAnonymous) {
                        donors.add(donation.donor);
                    };
                };
                Buffer.toArray(donors);
            };
        };
    };

    public query func getCampaignCount() : async Nat {
        campaigns.size();
    };
};
