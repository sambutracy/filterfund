export const idlFactory = ({ IDL }) => {
  const AssetId = IDL.Text;
  const Result_3 = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const Result_2 = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const ChunkId = IDL.Nat;
  const AssetType = IDL.Variant({
    'FilterImage' : IDL.Null,
    'MainImage' : IDL.Null,
    'Other' : IDL.Null,
  });
  const Asset = IDL.Record({
    'id' : AssetId,
    'contentType' : IDL.Text,
    'owner' : IDL.Principal,
    'createdAt' : IDL.Int,
    'chunkIds' : IDL.Vec(ChunkId),
    'filename' : IDL.Text,
    'assetType' : AssetType,
  });
  const HeaderField = IDL.Tuple(IDL.Text, IDL.Text);
  const HttpRequest = IDL.Record({
    'url' : IDL.Text,
    'method' : IDL.Text,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
  });
  const StreamingCallbackToken = IDL.Record({
    'id' : AssetId,
    'chunkIndex' : IDL.Nat,
    'assetType' : AssetType,
  });
  const StreamingCallbackResponse = IDL.Record({
    'token' : IDL.Opt(StreamingCallbackToken),
    'body' : IDL.Vec(IDL.Nat8),
  });
  const StreamingCallback = IDL.Func(
      [StreamingCallbackToken],
      [StreamingCallbackResponse],
      ['query'],
    );
  const StreamingStrategy = IDL.Variant({
    'Callback' : IDL.Record({
      'token' : StreamingCallbackToken,
      'callback' : StreamingCallback,
    }),
  });
  const HttpResponse = IDL.Record({
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
    'streaming_strategy' : IDL.Opt(StreamingStrategy),
    'status_code' : IDL.Nat16,
  });
  const Result_1 = IDL.Variant({ 'ok' : AssetId, 'err' : IDL.Text });
  const Result = IDL.Variant({ 'ok' : ChunkId, 'err' : IDL.Text });
  return IDL.Service({
    'acceptCycles' : IDL.Func([], [], []),
    'deleteAsset' : IDL.Func([AssetId], [Result_3], []),
    'finishAssetUpload' : IDL.Func([AssetId], [Result_2], []),
    'getAssetInfo' : IDL.Func([AssetId], [IDL.Opt(Asset)], ['query']),
    'getMyAssets' : IDL.Func([], [IDL.Vec(Asset)], ['query']),
    'http_request' : IDL.Func([HttpRequest], [HttpResponse], ['query']),
    'startAssetUpload' : IDL.Func(
        [IDL.Text, IDL.Text, AssetType],
        [Result_1],
        [],
      ),
    'uploadChunk' : IDL.Func([AssetId, IDL.Vec(IDL.Nat8)], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
