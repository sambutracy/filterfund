// Campaign Canister
import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import Float "mo:base/Float";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Order "mo:base/Order";

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
    private stable var campaignsArray : [Campaign] = [];
    private stable var userCampaignsEntries : [(Principal, [CampaignId])] = [];
    
    // Using a simple array-based approach instead of HashMap which is causing issues
    private var campaignsData : [var Campaign] = [var];
    
    private var userCampaigns = HashMap.HashMap<Principal, [CampaignId]>(
        0, Principal.equal, Principal.hash
    );

    // Initialize state from stable variables on upgrade
    system func preupgrade() {
        campaignsArray := Array.freeze(campaignsData);
        userCampaignsEntries := Iter.toArray(userCampaigns.entries());
    };

    system func postupgrade() {
        // Initialize campaigns array
        campaignsData := Array.thaw(campaignsArray);
        
        // Initialize user campaigns map
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
                // Using Buffer instead of Array.append for better performance
                let buffer = Buffer.Buffer<CampaignId>(campaigns.size() + 1);
                for (id in campaigns.vals()) {
                    buffer.add(id);
                };
                buffer.add(campaignId);
                userCampaigns.put(userId, Buffer.toArray(buffer));
            };
        };
    };

    // Helper function to find a campaign by ID
    private func findCampaign(id: CampaignId) : ?Campaign {
        if (id >= campaignsData.size()) {
            return null;
        };
        return ?campaignsData[id];
    };

    // Helper function to update a campaign
    private func updateCampaign(id: CampaignId, campaign: Campaign) : Bool {
        if (id >= campaignsData.size()) {
            return false;
        };
        campaignsData[id] := campaign;
        return true;
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

        // Add to array (expand if needed)
        if (campaignId >= campaignsData.size()) {
            let newSize = campaignId + 1;
            let newArray = Array.init<Campaign>(newSize, newCampaign);
            campaignsData := Array.thaw(Array.freeze(newArray));
        } else {
            campaignsData[campaignId] := newCampaign;
        };
        
        addToUserCampaigns(caller, campaignId);
        
        nextCampaignId += 1;
        #ok(campaignId);
    };

    public query func getCampaign(id: CampaignId) : async ?Campaign {
        findCampaign(id)
    };

    public query func getAllCampaigns() : async [Campaign] {
        // Filter out empty slots if any
        let buffer = Buffer.Buffer<Campaign>(campaignsData.size());
        for (i in campaignsData.vals()) {
            buffer.add(i);
        };
        Buffer.toArray(buffer)
    };

    public query func getCampaignsByCategory(category: CauseCategory) : async [Campaign] {
        let filtered = Buffer.Buffer<Campaign>(0);
        for (campaign in campaignsData.vals()) {
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
            switch (findCampaign(id)) {
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
        
        switch (findCampaign(campaignId)) {
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
                
                // Using Buffer instead of Array.append for better performance
                let donationsBuffer = Buffer.Buffer<Donation>(campaign.donations.size() + 1);
                for (d in campaign.donations.vals()) {
                    donationsBuffer.add(d);
                };
                donationsBuffer.add(donation);
                let updatedDonations = Buffer.toArray(donationsBuffer);
                
                let updatedAmountCollected = campaign.amountCollected + amount;
                
                let updatedCampaign = {
                    campaign with
                    donations = updatedDonations;
                    amountCollected = updatedAmountCollected;
                };
                
                let success = updateCampaign(campaignId, updatedCampaign);
                if (success) {
                    #ok(());
                } else {
                    #err("Failed to update campaign");
                };
            };
        };
    };

    public shared(msg) func updateCampaignStatus(campaignId: CampaignId, isActive: Bool) : async Result.Result<(), Text> {
        let caller = msg.caller;
        
        switch (findCampaign(campaignId)) {
            case (null) { return #err("Campaign not found"); };
            case (?campaign) {
                if (not Principal.equal(caller, campaign.creator)) {
                    return #err("Only the creator can update campaign status");
                };
                
                let updatedCampaign = {
                    campaign with
                    isActive = isActive;
                };
                
                let success = updateCampaign(campaignId, updatedCampaign);
                if (success) {
                    #ok(());
                } else {
                    #err("Failed to update campaign");
                };
            };
        };
    };

    // Query functions for statistics and reporting
    public query func getActiveCampaigns() : async [Campaign] {
        let filtered = Buffer.Buffer<Campaign>(0);
        for (campaign in campaignsData.vals()) {
            if (campaign.isActive and campaign.deadline > Time.now()) {
                filtered.add(campaign);
            };
        };
        Buffer.toArray(filtered);
    };

    // Helper function for Array.sort that returns Order
    private func compareByAmount(a: Campaign, b: Campaign) : Order.Order {
        if (a.amountCollected > b.amountCollected) {
            #less    // We want descending order for amount
        } else if (a.amountCollected < b.amountCollected) {
            #greater
        } else {
            #equal
        }
    };

    // Helper function for Array.sort that returns Order for created timestamp
    private func compareByCreated(a: Campaign, b: Campaign) : Order.Order {
        if (a.created > b.created) {
            #less    // We want descending order for newest first
        } else if (a.created < b.created) {
            #greater
        } else {
            #equal
        }
    };

    public query func getTopCampaigns(limit: Nat) : async [Campaign] {
        var allCampaigns = Array.freeze(campaignsData);
        
        // Sort by amount collected (descending)
        allCampaigns := Array.sort(allCampaigns, compareByAmount);
        
        // Take only the specified limit
        if (allCampaigns.size() <= limit) {
            return allCampaigns;
        } else {
            return Array.subArray(allCampaigns, 0, limit);
        };
    };

    public query func getRecentCampaigns(limit: Nat) : async [Campaign] {
        var allCampaigns = Array.freeze(campaignsData);
        
        // Sort by creation time (descending)
        allCampaigns := Array.sort(allCampaigns, compareByCreated);
        
        // Take only the specified limit
        if (allCampaigns.size() <= limit) {
            return allCampaigns;
        } else {
            return Array.subArray(allCampaigns, 0, limit);
        };
    };

    public query func getCampaignDonors(campaignId: CampaignId) : async [Principal] {
        switch (findCampaign(campaignId)) {
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
        campaignsData.size();
    };
};
