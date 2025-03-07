import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type Result = { 'ok' : null } |
  { 'err' : string };
export type Result_1 = { 'ok' : Principal } |
  { 'err' : string };
export interface UserProfile {
  'bio' : [] | [string],
  'created' : bigint,
  'principal' : Principal,
  'username' : string,
  'campaignsCreated' : bigint,
  'socialLinks' : Array<string>,
  'email' : string,
  'avatarUrl' : [] | [string],
  'totalDonations' : bigint,
}
export interface _SERVICE {
  'deleteUser' : ActorMethod<[], Result>,
  'getAllUsers' : ActorMethod<[], Array<UserProfile>>,
  'getUserCount' : ActorMethod<[], bigint>,
  'getUserProfile' : ActorMethod<[Principal], [] | [UserProfile]>,
  'getUserProfileByUsername' : ActorMethod<[string], [] | [UserProfile]>,
  'registerUser' : ActorMethod<
    [string, string, [] | [string], [] | [string], Array<string>],
    Result_1
  >,
  'searchUsers' : ActorMethod<[string], Array<UserProfile>>,
  'updateUserProfile' : ActorMethod<
    [
      [] | [string],
      [] | [string],
      [] | [string],
      [] | [string],
      [] | [Array<string>],
    ],
    Result
  >,
  'updateUserStats' : ActorMethod<[[] | [bigint], [] | [bigint]], Result>,
}
