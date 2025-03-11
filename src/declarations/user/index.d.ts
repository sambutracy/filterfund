// src/declarations/user/index.d.ts - Add direct type exports

import type { ActorSubclass, HttpAgentOptions, ActorConfig, Agent } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";
import type { IDL } from "@dfinity/candid";

// Re-export needed types directly
export type UserId = Principal;

export type UserProfile = {
  principal: Principal;
  username: string;
  email: string;
  bio: [] | [string];
  avatarUrl: [] | [string];
  socialLinks: Array<string>;
  created: bigint;
  totalDonations: bigint;
  campaignsCreated: bigint;
};

export type Result = { 'ok': null } | { 'err': string };
export type Result_1 = { 'ok': Principal } | { 'err': string };

// Define the service interface
export interface _SERVICE {
  'deleteUser': () => Promise<Result>;
  'getAllUsers': () => Promise<Array<UserProfile>>;
  'getUserCount': () => Promise<bigint>;
  'getUserProfile': (arg_0: Principal) => Promise<[] | [UserProfile]>;
  'getUserProfileByUsername': (arg_0: string) => Promise<[] | [UserProfile]>;
  'getTopCreators': (arg_0: bigint) => Promise<Array<UserProfile>>;
  'getTopDonors': (arg_0: bigint) => Promise<Array<UserProfile>>;
  'registerUser': (arg_0: string, arg_1: string, arg_2: [] | [string], arg_3: [] | [string], arg_4: Array<string>) => Promise<Result_1>;
  'searchUsers': (arg_0: string) => Promise<Array<UserProfile>>;
  'updateUserProfile': (arg_0: [] | [string], arg_1: [] | [string], arg_2: [] | [string], arg_3: [] | [string], arg_4: [] | [Array<string>]) => Promise<Result>;
  'updateUserStats': (arg_0: [] | [bigint], arg_1: [] | [bigint]) => Promise<Result>;
  'updateUserStatsByPrincipal': (arg_0: Principal, arg_1: [] | [bigint], arg_2: [] | [bigint]) => Promise<Result>;
}

export declare const idlFactory: IDL.InterfaceFactory;
export declare const canisterId: string;

export declare interface CreateActorOptions {
  agent?: Agent;
  agentOptions?: HttpAgentOptions;
  actorOptions?: ActorConfig;
}

export declare const createActor: (
  canisterId: string | Principal,
  options?: CreateActorOptions
) => ActorSubclass<_SERVICE>;

export declare const user: ActorSubclass<_SERVICE>;