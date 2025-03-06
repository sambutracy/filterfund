import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import UserCanister "main"; // Import the main canister
import Result "mo:base/Result";

actor TestUserCanister {
    private let userCanister = UserCanister;

    public func testRegisterUser() : async () {
        let principal = Principal.fromText("your_test_principal_id"); // Replace with a test principal
        let result = await userCanister.registerUser("testuser", "test@example.com", null, []);

        switch (result) {
            case (#ok(principalId)) {
                Debug.print("User registered with principal: " # Principal.toText(principalId));
            };
            case (#err(error)) {
                Debug.print("Error registering user: " # error);
            };
        }
    };

    // Additional tests for other functionalities...
}; 