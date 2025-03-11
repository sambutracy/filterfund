// Complete User Canister Implementation
import Array "mo:base/Array";
import Hash "mo:base/Hash";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Char "mo:base/Char";
import Nat32 "mo:base/Nat32";
import Debug "mo:base/Debug";

actor UserCanister {
    // Type definitions
    public type UserId = Principal;
    
    public type UserProfile = {
        principal: Principal;
        username: Text;
        email: Text;
        bio: ?Text;
        avatarUrl: ?Text; // URL to user avatar in the Asset canister
        socialLinks: [Text];
        created: Int;
        totalDonations: Nat;
        campaignsCreated: Nat;
    };
    
    // State variables
    private stable var userEntriesStable : [(Principal, UserProfile)] = [];
    
    private var users = HashMap.HashMap<Principal, UserProfile>(
        0, Principal.equal, Principal.hash
    );
    
    // System functions for upgrades
    system func preupgrade() {
        userEntriesStable := Iter.toArray(users.entries());
    };
    
    system func postupgrade() {
        users := HashMap.fromIter<Principal, UserProfile>(
            userEntriesStable.vals(), 10, Principal.equal, Principal.hash
        );
    };
    
    // Helper functions for lowercase conversion
    private func charToLower(c: Char) : Char {
        let n = Char.toNat32(c);
        if (n >= 65 and n <= 90) {
            // If uppercase ASCII letter (A-Z), convert to lowercase
            Char.fromNat32(n + 32)
        } else {
            c
        }
    };
    
    private func textToLower(t: Text) : Text {
        let cs = Text.toIter(t);
        var result = "";
        for (c in cs) {
            result := result # Char.toText(charToLower(c));
        };
        result
    };
    
    // User management functions
    public shared(msg) func registerUser(
        username: Text,
        email: Text,
        bio: ?Text,
        avatarUrl: ?Text,
        socialLinks: [Text]
    ) : async Result.Result<Principal, Text> {
        let caller = msg.caller;
        
        if (Principal.isAnonymous(caller)) {
            return #err("Anonymous principals cannot register");
        };
        
        // Validate inputs
        if (Text.size(username) < 3) {
            return #err("Username must be at least 3 characters");
        };
        
        if (Text.size(email) < 5 or not Text.contains(email, #text "@")) {
            return #err("Invalid email format");
        };
        
        // Check if user already exists
        switch (users.get(caller)) {
            case (?_) { return #err("User already registered"); };
            case (null) {
                // Create new user profile
                let newProfile: UserProfile = {
                    principal = caller;
                    username = username;
                    email = email;
                    bio = bio;
                    avatarUrl = avatarUrl;
                    socialLinks = socialLinks;
                    created = Time.now();
                    totalDonations = 0;
                    campaignsCreated = 0;
                };
                
                users.put(caller, newProfile);
                #ok(caller);
            };
        };
    };
    
    public query func getUserProfile(userId: Principal) : async ?UserProfile {
        users.get(userId);
    };
    
    public query func getUserProfileByUsername(username: Text) : async ?UserProfile {
        let matchingUsers = Iter.toArray(Iter.filter(users.vals(), func (profile: UserProfile) : Bool {
            Text.equal(profile.username, username)
        }));
        
        if (matchingUsers.size() > 0) {
            ?matchingUsers[0];
        } else {
            null;
        };
    };
    
    public shared(msg) func updateUserProfile(
        username: ?Text,
        email: ?Text,
        bio: ?Text,
        avatarUrl: ?Text,
        socialLinks: ?[Text]
    ) : async Result.Result<(), Text> {
        let caller = msg.caller;
        
        switch (users.get(caller)) {
            case (null) { 
                return #err("User not found"); 
            };
            case (?profile) {
                // Validate updates
                switch(username) {
                    case (?name) {
                        if (Text.size(name) < 3) {
                            return #err("Username must be at least 3 characters");
                        };
                    };
                    case (null) {};
                };
                
                switch(email) {
                    case (?mail) {
                        if (Text.size(mail) < 5 or not Text.contains(mail, #text "@")) {
                            return #err("Invalid email format");
                        };
                    };
                    case (null) {};
                };
                
                let updatedProfile = {
                    profile with
                    username = Option.get(username, profile.username);
                    email = Option.get(email, profile.email);
                    bio = switch(bio) {
                        case (null) { profile.bio };
                        case (?value) { ?value };
                    };
                    avatarUrl = switch(avatarUrl) {
                        case (null) { profile.avatarUrl };
                        case (?value) { ?value };
                    };
                    socialLinks = Option.get(socialLinks, profile.socialLinks);
                };
                
                users.put(caller, updatedProfile);
                #ok(());
            };
        };
    };
    
    // User statistics update - accepts calls from other canisters
    public shared(msg) func updateUserStats(
        incrementDonations: ?Nat,
        incrementCampaigns: ?Nat
    ) : async Result.Result<(), Text> {
        // Get the user profile - allow calls from other canisters
        let caller = msg.caller;
        
        Debug.print("Updating user stats for user: " # Principal.toText(caller));
        Debug.print("incrementDonations: " # debug_show(incrementDonations));
        Debug.print("incrementCampaigns: " # debug_show(incrementCampaigns));
        
        // Try to find the user by principal
        switch (users.get(caller)) {
            case (null) { 
                // If user doesn't exist, create a default profile
                let defaultProfile = {
                    principal = caller;
                    username = "User_" # Principal.toText(caller).substring(0, 5);
                    email = "user@filterfund.com";
                    bio = ?"FilterFund User";
                    avatarUrl = null;
                    socialLinks = [];
                    created = Time.now();
                    totalDonations = Option.get(incrementDonations, 0);
                    campaignsCreated = Option.get(incrementCampaigns, 0);
                };
                
                users.put(caller, defaultProfile);
                #ok(());
            };
            case (?profile) {
                let newDonations = profile.totalDonations + Option.get(incrementDonations, 0);
                let newCampaigns = profile.campaignsCreated + Option.get(incrementCampaigns, 0);
                
                let updatedProfile = {
                    profile with
                    totalDonations = newDonations;
                    campaignsCreated = newCampaigns;
                };
                
                users.put(caller, updatedProfile);
                #ok(());
            };
        };
    };
    
    // New function to update stats for any user (for campaign canister to use)
    public shared(msg) func updateUserStatsByPrincipal(
        userId: Principal,
        incrementDonations: ?Nat,
        incrementCampaigns: ?Nat
    ) : async Result.Result<(), Text> {
        // Permission check - only allow from campaign canister
        let CAMPAIGN_CANISTER_ID = Principal.fromText("be2us-64aaa-aaaaa-qaabq-cai");
        
        if (not Principal.equal(msg.caller, CAMPAIGN_CANISTER_ID)) {
            return #err("Unauthorized: only campaign canister can call this function");
        };
        
        // Try to find the user by principal
        switch (users.get(userId)) {
            case (null) { 
                // If user doesn't exist, create a default profile
                let defaultProfile = {
                    principal = userId;
                    username = "User_" # Principal.toText(userId).substring(0, 5);
                    email = "user@filterfund.com";
                    bio = ?"FilterFund User";
                    avatarUrl = null;
                    socialLinks = [];
                    created = Time.now();
                    totalDonations = Option.get(incrementDonations, 0);
                    campaignsCreated = Option.get(incrementCampaigns, 0);
                };
                
                users.put(userId, defaultProfile);
                #ok(());
            };
            case (?profile) {
                let newDonations = profile.totalDonations + Option.get(incrementDonations, 0);
                let newCampaigns = profile.campaignsCreated + Option.get(incrementCampaigns, 0);
                
                let updatedProfile = {
                    profile with
                    totalDonations = newDonations;
                    campaignsCreated = newCampaigns;
                };
                
                users.put(userId, updatedProfile);
                #ok(());
            };
        };
    };
    
    public shared(msg) func deleteUser() : async Result.Result<(), Text> {
        let caller = msg.caller;
        
        if (Principal.isAnonymous(caller)) {
            return #err("Anonymous principals cannot delete accounts");
        };
        
        switch (users.get(caller)) {
            case (null) { 
                return #err("User not found"); 
            };
            case (?_) {
                users.delete(caller);
                #ok(());
            };
        };
    };
    
    // User query functions
    public query func getAllUsers() : async [UserProfile] {
        Iter.toArray(users.vals());
    };
    
    public query func getUserCount() : async Nat {
        users.size();
    };
    
    public query func searchUsers(term: Text) : async [UserProfile] {
        let searchTerm = textToLower(term);
        
        let matches = Iter.toArray(Iter.filter(users.vals(), func (profile: UserProfile) : Bool {
            Text.contains(textToLower(profile.username), #text searchTerm) or
            (switch (profile.bio) {
                case (null) { false };
                case (?bio) { Text.contains(textToLower(bio), #text searchTerm) };
            })
        }));
        
        matches;
    };
    
    // New helpers to get top users
    public query func getTopCreators(limit: Nat) : async [UserProfile] {
        let allUsers = Iter.toArray(users.vals());
        let sortedUsers = Array.sort<UserProfile>(
            allUsers,
            func(a: UserProfile, b: UserProfile) : {#less; #equal; #greater} {
                if (a.campaignsCreated > b.campaignsCreated) {
                    #less
                } else if (a.campaignsCreated < b.campaignsCreated) {
                    #greater
                } else {
                    #equal
                }
            }
        );
        
        let resultLimit = if (sortedUsers.size() < limit) {
            sortedUsers.size()
        } else {
            limit
        };
        
        Array.subArray(sortedUsers, 0, resultLimit);
    };
    
    public query func getTopDonors(limit: Nat) : async [UserProfile] {
        let allUsers = Iter.toArray(users.vals());
        let sortedUsers = Array.sort<UserProfile>(
            allUsers,
            func(a: UserProfile, b: UserProfile) : {#less; #equal; #greater} {
                if (a.totalDonations > b.totalDonations) {
                    #less
                } else if (a.totalDonations < b.totalDonations) {
                    #greater
                } else {
                    #equal
                }
            }
        );
        
        let resultLimit = if (sortedUsers.size() < limit) {
            sortedUsers.size()
        } else {
            limit
        };
        
        Array.subArray(sortedUsers, 0, resultLimit);
    };
};