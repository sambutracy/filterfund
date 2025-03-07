export const idlFactory = ({ IDL }) => {
  const FilterDetails = IDL.Record({
    'previewImage' : IDL.Text,
    'filterType' : IDL.Text,
    'platform' : IDL.Text,
    'instructions' : IDL.Text,
    'filterUrl' : IDL.Text,
  });
  const CauseCategory = IDL.Variant({
    'Health' : IDL.Null,
    'Environment' : IDL.Null,
    'Poverty' : IDL.Null,
    'Equality' : IDL.Null,
    'AnimalWelfare' : IDL.Null,
    'Other' : IDL.Null,
    'Education' : IDL.Null,
    'HumanRights' : IDL.Null,
  });
  const CreateCampaignRequest = IDL.Record({
    'title' : IDL.Text,
    'description' : IDL.Text,
    'deadline' : IDL.Int,
    'filterImage' : IDL.Text,
    'creatorName' : IDL.Text,
    'filter' : FilterDetails,
    'target' : IDL.Nat,
    'category' : CauseCategory,
    'mainImage' : IDL.Text,
  });
  const CampaignId = IDL.Nat;
  const Result_1 = IDL.Variant({ 'ok' : CampaignId, 'err' : IDL.Text });
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const Donation = IDL.Record({
    'isAnonymous' : IDL.Bool,
    'message' : IDL.Opt(IDL.Text),
    'timestamp' : IDL.Int,
    'amount' : IDL.Nat,
    'donor' : IDL.Principal,
  });
  const Campaign = IDL.Record({
    'id' : CampaignId,
    'title' : IDL.Text,
    'created' : IDL.Int,
    'creator' : IDL.Principal,
    'amountCollected' : IDL.Nat,
    'description' : IDL.Text,
    'deadline' : IDL.Int,
    'filterImage' : IDL.Text,
    'creatorName' : IDL.Text,
    'isActive' : IDL.Bool,
    'filter' : FilterDetails,
    'target' : IDL.Nat,
    'category' : CauseCategory,
    'mainImage' : IDL.Text,
    'donations' : IDL.Vec(Donation),
  });
  return IDL.Service({
    'createCampaign' : IDL.Func([CreateCampaignRequest], [Result_1], []),
    'donateToCampaign' : IDL.Func(
        [CampaignId, IDL.Nat, IDL.Opt(IDL.Text), IDL.Bool],
        [Result],
        [],
      ),
    'getActiveCampaigns' : IDL.Func([], [IDL.Vec(Campaign)], ['query']),
    'getAllCampaigns' : IDL.Func([], [IDL.Vec(Campaign)], ['query']),
    'getCampaign' : IDL.Func([CampaignId], [IDL.Opt(Campaign)], ['query']),
    'getCampaignCount' : IDL.Func([], [IDL.Nat], ['query']),
    'getCampaignDonors' : IDL.Func(
        [CampaignId],
        [IDL.Vec(IDL.Principal)],
        ['query'],
      ),
    'getCampaignsByCategory' : IDL.Func(
        [CauseCategory],
        [IDL.Vec(Campaign)],
        ['query'],
      ),
    'getMyCampaigns' : IDL.Func([], [IDL.Vec(Campaign)], ['query']),
    'getRecentCampaigns' : IDL.Func([IDL.Nat], [IDL.Vec(Campaign)], ['query']),
    'getTopCampaigns' : IDL.Func([IDL.Nat], [IDL.Vec(Campaign)], ['query']),
    'updateCampaignStatus' : IDL.Func([CampaignId, IDL.Bool], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
