import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Campaign {
  'id' : CampaignId,
  'title' : string,
  'created' : bigint,
  'creator' : Principal,
  'amountCollected' : bigint,
  'description' : string,
  'deadline' : bigint,
  'filterImage' : string,
  'creatorName' : string,
  'isActive' : boolean,
  'filter' : FilterDetails,
  'target' : bigint,
  'category' : CauseCategory,
  'mainImage' : string,
  'donations' : Array<Donation>,
}
export type CampaignId = bigint;
export type CauseCategory = { 'Health' : null } |
  { 'Environment' : null } |
  { 'Poverty' : null } |
  { 'Equality' : null } |
  { 'AnimalWelfare' : null } |
  { 'Other' : null } |
  { 'Education' : null } |
  { 'HumanRights' : null };
export interface CreateCampaignRequest {
  'title' : string,
  'description' : string,
  'deadline' : bigint,
  'filterImage' : string,
  'creatorName' : string,
  'filter' : FilterDetails,
  'target' : bigint,
  'category' : CauseCategory,
  'mainImage' : string,
}
export interface Donation {
  'isAnonymous' : boolean,
  'message' : [] | [string],
  'timestamp' : bigint,
  'amount' : bigint,
  'donor' : Principal,
}
export interface FilterDetails {
  'previewImage' : string,
  'filterType' : string,
  'platform' : string,
  'instructions' : string,
  'filterUrl' : string,
}
export type Result = { 'ok' : null } |
  { 'err' : string };
export type Result_1 = { 'ok' : CampaignId } |
  { 'err' : string };
export interface _SERVICE {
  'createCampaign' : ActorMethod<[CreateCampaignRequest], Result_1>,
  'donateToCampaign' : ActorMethod<
    [CampaignId, bigint, [] | [string], boolean],
    Result
  >,
  'getActiveCampaigns' : ActorMethod<[], Array<Campaign>>,
  'getAllCampaigns' : ActorMethod<[], Array<Campaign>>,
  'getCampaign' : ActorMethod<[CampaignId], [] | [Campaign]>,
  'getCampaignCount' : ActorMethod<[], bigint>,
  'getCampaignDonors' : ActorMethod<[CampaignId], Array<Principal>>,
  'getCampaignsByCategory' : ActorMethod<[CauseCategory], Array<Campaign>>,
  'getMyCampaigns' : ActorMethod<[], Array<Campaign>>,
  'getRecentCampaigns' : ActorMethod<[bigint], Array<Campaign>>,
  'getTopCampaigns' : ActorMethod<[bigint], Array<Campaign>>,
  'updateCampaignStatus' : ActorMethod<[CampaignId, boolean], Result>,
}
