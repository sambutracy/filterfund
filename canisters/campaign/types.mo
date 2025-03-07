// canisters/campaign/types.mo
import Principal "mo:base/Principal";
import Time "mo:base/Time";

module {
    public type CampaignId = Nat;

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

    public type Donation = {
        donor: Principal;
        amount: Nat;
        message: ?Text;
        timestamp: Int;
        isAnonymous: Bool;
    };

    public type ImpactMetrics = {
        peopleImpacted: Nat;
        locationsCovered: [Text];
        itemsToDeliver: Nat;
        successMetric: Text;
    };

    public type SocialLinks = {
        creatorPortfolio: ?Text;
        campaignInstagram: ?Text;
        campaignTwitter: ?Text;
        additionalLinks: [Text];
    };

    public type Campaign = {
        id: CampaignId;
        creator: Principal;
        creatorName: ?Text;
        title: Text;
        description: Text;
        target: Nat;
        deadline: Int;
        amountCollected: Nat;
        mainImage: Text;
        category: CauseCategory;
        filter: FilterDetails;
        impactMetrics: ImpactMetrics;
        donations: [Donation];
        isActive: Bool;
        created: Int;
        socialLinks: SocialLinks;
    };

    // This is just a reference to the type in FilterTypes
    // It will be imported from filter/types.mo
    public type FilterDetails = {
        platform: Text;
        filterUrl: Text;
        previewImage: Text;
        filterType: Text;
        instructions: Text;
    };
}
