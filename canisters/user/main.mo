// canisters/user/main.mo
import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Option "mo:base/Option";
import Text "mo:base/Text";
// Import the modified Text module we created
import CustomText "../utils/Text"; 

actor UserCanister {
    type UserProfile = {
        principal: Principal;
        username: Text;
        email: Text;
        created: Int;
        bio: ?Text;
        socialLinks: [Text];
    };

    private var users = HashMap.HashMap<Principal, UserProfile>(
        0, Principal.equal, Principal.hash
    );

    // Register a new user
    public shared(msg) func registerUser(username: Text, email: Text, bio: ?Text, socialLinks: [Text]) : async Result.Result<Principal, Text> {
        let principal = msg.caller;

        // Validate inputs - use our custom Text module functions
        if (Text.size(username) == 0) { return #err("Username cannot be empty") };
        if (Text.size(email) == 0) { return #err("Email cannot be empty") };

        // Check if user already exists
        switch (users.get(principal)) {
            case (?_) { return #err("User already registered") };
            case (null) { /* User does not exist, continue */ };
        };

        let profile: UserProfile = {
            principal = principal;
            username = username;
            email = email;
            created = Time.now();
            bio = bio;
            socialLinks = socialLinks;
        };

        users.put(principal, profile);
        #ok(principal)
    };

    // Get user profile
    public query func getUserProfile(principal: Principal) : async ?UserProfile {
        users.get(principal)
    };

    // Update user profile
    public shared(msg) func updateUserProfile(username: ?Text, bio: ?Text, socialLinks: ?[Text]) : async Bool {
        let principal = msg.caller;

        switch (users.get(principal)) {
            case (null) { return false; };
            case (?profile) {
                let updatedProfile = {
                    profile with
                    username = Option.get(username, profile.username);
                    bio = Option.get(bio, profile.bio);
                    socialLinks = Option.get(socialLinks, profile.socialLinks);
                };

                users.put(principal, updatedProfile);
                true
            };
        }
    };

    // Delete user account
    public shared(msg) func deleteUser() : async Bool {
        let principal = msg.caller;

        switch (users.get(principal)) {
            case (null) { return false; };
            case (?_) {
                users.delete(principal);
                true
            };
        }
    };
};
