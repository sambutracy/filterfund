import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Asset {
  'id' : AssetId,
  'contentType' : string,
  'owner' : Principal,
  'createdAt' : bigint,
  'chunkIds' : Array<ChunkId>,
  'filename' : string,
  'assetType' : AssetType,
}
export type AssetId = string;
export type AssetType = { 'FilterImage' : null } |
  { 'MainImage' : null } |
  { 'Other' : null };
export type ChunkId = bigint;
export type HeaderField = [string, string];
export interface HttpRequest {
  'url' : string,
  'method' : string,
  'body' : Uint8Array | number[],
  'headers' : Array<HeaderField>,
}
export interface HttpResponse {
  'body' : Uint8Array | number[],
  'headers' : Array<HeaderField>,
  'streaming_strategy' : [] | [StreamingStrategy],
  'status_code' : number,
}
export type Result = { 'ok' : ChunkId } |
  { 'err' : string };
export type Result_1 = { 'ok' : AssetId } |
  { 'err' : string };
export type Result_2 = { 'ok' : string } |
  { 'err' : string };
export type Result_3 = { 'ok' : null } |
  { 'err' : string };
export type StreamingCallback = ActorMethod<
  [StreamingCallbackToken],
  StreamingCallbackResponse
>;
export interface StreamingCallbackResponse {
  'token' : [] | [StreamingCallbackToken],
  'body' : Uint8Array | number[],
}
export interface StreamingCallbackToken {
  'id' : AssetId,
  'chunkIndex' : bigint,
  'assetType' : AssetType,
}
export type StreamingStrategy = {
    'Callback' : {
      'token' : StreamingCallbackToken,
      'callback' : StreamingCallback,
    }
  };
export interface _SERVICE {
  'acceptCycles' : ActorMethod<[], undefined>,
  'deleteAsset' : ActorMethod<[AssetId], Result_3>,
  'finishAssetUpload' : ActorMethod<[AssetId], Result_2>,
  'getAssetInfo' : ActorMethod<[AssetId], [] | [Asset]>,
  'getMyAssets' : ActorMethod<[], Array<Asset>>,
  'http_request' : ActorMethod<[HttpRequest], HttpResponse>,
  'startAssetUpload' : ActorMethod<[string, string, AssetType], Result_1>,
  'uploadChunk' : ActorMethod<[AssetId, Uint8Array | number[]], Result>,
}
