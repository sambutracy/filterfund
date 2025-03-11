// src/declarations/asset/index.d.ts - Add direct type exports

import type { ActorSubclass, HttpAgentOptions, ActorConfig, Agent } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";
import type { IDL } from "@dfinity/candid";

// Re-export needed types directly
export type AssetId = string;
export type ChunkId = bigint;
export type AssetType = { 'MainImage': null } | { 'FilterImage': null } | { 'Other': null };

export type Asset = {
  id: AssetId;
  owner: Principal;
  createdAt: bigint;
  contentType: string;
  filename: string;
  chunkIds: Array<ChunkId>;
  assetType: AssetType;
};

export type Result = { 'ok': ChunkId } | { 'err': string };
export type Result_1 = { 'ok': AssetId } | { 'err': string };
export type Result_2 = { 'ok': string } | { 'err': string };
export type Result_3 = { 'ok': null } | { 'err': string };

// Define the service interface
export interface _SERVICE {
  'acceptCycles': () => Promise<void>;
  'deleteAsset': (arg_0: AssetId) => Promise<Result_3>;
  'finishAssetUpload': (arg_0: AssetId) => Promise<Result_2>;
  'getAssetInfo': (arg_0: AssetId) => Promise<[] | [Asset]>;
  'getMyAssets': () => Promise<Array<Asset>>;
  'startAssetUpload': (arg_0: string, arg_1: string, arg_2: AssetType) => Promise<Result_1>;
  'uploadAssetSimple': (arg_0: string, arg_1: string, arg_2: Array<number>, arg_3: AssetType) => Promise<Result_2>;
  'uploadChunk': (arg_0: AssetId, arg_1: Array<number>) => Promise<Result>;
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

export declare const asset: ActorSubclass<_SERVICE>;