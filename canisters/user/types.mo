// canisters/user/types.mo
import Principal "mo:base/Principal";
import Time "mo:base/Time";

module {
    public type UserProfile = {
        principal: Principal;
        username: Text;
        email: Text;
        created: Int;
        bio: ?Text;
        socialLinks: [Text];
    };
}