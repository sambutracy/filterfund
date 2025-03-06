import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Time "mo:base/Time";
import Result "mo:base/Result";

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

        // Validate inputs
        if (Text.size(username) == 0) { return #err("Username cannot be empty") };
        if (Text.size(email) == 0) { return #err("Email cannot be empty") };

        // Check if user already exists
        if (users.contains(principal)) { return #err("User already registered") };

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
                    username = switch (username) {
                        case (null) { profile.username };
                        case (?newUsername) { newUsername };
                    };
                    bio = switch (bio) {
                        case (null) { profile.bio };
                        case (?newBio) { newBio };
                    };
                    socialLinks = switch (socialLinks) {
                        case (null) { profile.socialLinks };
                        case (?newLinks) { newLinks };
                    };
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
            case (?profile) {
                users.remove(principal);
                true
            };
        }
    };
};
