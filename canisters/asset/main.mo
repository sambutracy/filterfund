// Asset Canister for handling file uploads (images)
import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";

actor AssetCanister {
    
    // Type definitions
    public type AssetId = Text;
    public type ChunkId = Nat;
    public type AssetType = {
        #MainImage;   // Campaign main image
        #FilterImage; // QR code image for Snapchat filter
        #Other;       // Other asset types
    };
    
    public type Asset = {
        id: AssetId;
        owner: Principal;
        createdAt: Int;
        contentType: Text;
        filename: Text;
        chunkIds: [ChunkId];
        assetType: AssetType;
    };
    
    public type AssetChunk = {
        id: ChunkId;
        data: Blob;
    };
    
    public type HeaderField = (Text, Text);
    
    public type HttpRequest = {
        url: Text;
        method: Text;
        body: Blob;
        headers: [HeaderField];
    };
    
    public type HttpResponse = {
        body: Blob;
        headers: [HeaderField];
        status_code: Nat16;
        streaming_strategy: ?StreamingStrategy;
    };
    
    public type StreamingCallback = query (StreamingCallbackToken) -> async (StreamingCallbackResponse);
    
    public type StreamingCallbackToken = {
        id: AssetId;
        chunkIndex: Nat;
        assetType: AssetType;
    };
    
    public type StreamingCallbackResponse = {
        body: Blob;
        token: ?StreamingCallbackToken;
    };
    
    public type StreamingStrategy = {
        #Callback: {
            callback: StreamingCallback;
            token: StreamingCallbackToken;
        };
    };
    
    // State variables
    private stable var nextChunkId: Nat = 0;
    private stable var assetsEntries: [(AssetId, Asset)] = [];
    private stable var chunksEntries: [(ChunkId, AssetChunk)] = [];
    
    private var assets = HashMap.HashMap<AssetId, Asset>(
        0, Text.equal, Text.hash
    );
    
    private var chunks = HashMap.HashMap<ChunkId, AssetChunk>(
        0, Nat.equal, Hash.hash
    );
    
    // Initialize state from stable variables on upgrade
    system func preupgrade() {
        assetsEntries := Iter.toArray(assets.entries());
        chunksEntries := Iter.toArray(chunks.entries());
    };
    
    system func postupgrade() {
        assets := HashMap.fromIter<AssetId, Asset>(
            assetsEntries.vals(), 10, Text.equal, Text.hash
        );
        chunks := HashMap.fromIter<ChunkId, AssetChunk>(
            chunksEntries.vals(), 10, Nat.equal, Hash.hash
        );
    };
    
    // Helper functions
    private func generateAssetId(principal: Principal, filename: Text, timestamp: Int) : AssetId {
        let principalText = Principal.toText(principal);
        let timestampText = Int.toText(timestamp);
        principalText # "-" # filename # "-" # timestampText
    };
    
    private func validateContentType(contentType: Text) : Bool {
        let validTypes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/svg+xml",
            "image/webp"
        ];
        
        for (valid in validTypes.vals()) {
            if (valid == contentType) {
                return true;
            };
        };
        
        false
    };
    
    // Asset management functions
    public shared(msg) func startAssetUpload(
        filename: Text,
        contentType: Text,
        assetType: AssetType
    ) : async Result.Result<AssetId, Text> {
        let caller = msg.caller;
        
        // Validation
        if (Principal.isAnonymous(caller)) {
            return #err("Anonymous principal not allowed");
        };
        
        if (not validateContentType(contentType)) {
            return #err("Invalid content type. Only images are supported.");
        };
        
        let timestamp = Time.now();
        let assetId = generateAssetId(caller, filename, timestamp);
        
        let newAsset: Asset = {
            id = assetId;
            owner = caller;
            createdAt = timestamp;
            contentType = contentType;
            filename = filename;
            chunkIds = [];
            assetType = assetType;
        };
        
        assets.put(assetId, newAsset);
        
        #ok(assetId);
    };
    
    public shared(msg) func uploadChunk(
        assetId: AssetId,
        data: Blob
    ) : async Result.Result<ChunkId, Text> {
        let caller = msg.caller;
        
        // Validation
        switch (assets.get(assetId)) {
            case (null) {
                return #err("Asset not found");
            };
            case (?asset) {
                if (Principal.notEqual(caller, asset.owner)) {
                    return #err("Only the asset owner can upload chunks");
                };
                
                let chunkId = nextChunkId;
                nextChunkId += 1;
                
                let chunk: AssetChunk = {
                    id = chunkId;
                    data = data;
                };
                
                chunks.put(chunkId, chunk);
                
                let updatedChunkIds = Array.append(asset.chunkIds, [chunkId]);
                let updatedAsset = {
                    asset with
                    chunkIds = updatedChunkIds;
                };
                
                assets.put(assetId, updatedAsset);
                
                #ok(chunkId);
            };
        };
    };
    
    public shared(msg) func finishAssetUpload(assetId: AssetId) : async Result.Result<Text, Text> {
        let caller = msg.caller;
        
        // Validation
        switch (assets.get(assetId)) {
            case (null) {
                return #err("Asset not found");
            };
            case (?asset) {
                if (Principal.notEqual(caller, asset.owner)) {
                    return #err("Only the asset owner can finish the upload");
                };
                
                if (asset.chunkIds.size() == 0) {
                    return #err("No chunks uploaded for this asset");
                };
                
                // Return the asset URL
                let assetUrl = "http://" # Principal.toText(Principal.fromActor(this)) # ".raw.ic0.app/asset/" # assetId;
                #ok(assetUrl);
            };
        };
    };
    
    public query func getAssetInfo(assetId: AssetId) : async ?Asset {
        assets.get(assetId);
    };
    
    public query(msg) func getMyAssets() : async [Asset] {
        let caller = msg.caller;
        let myAssets = Buffer.Buffer<Asset>(0);
        
        for (asset in assets.vals()) {
            if (Principal.equal(asset.owner, caller)) {
                myAssets.add(asset);
            };
        };
        
        Buffer.toArray(myAssets);
    };
    
    // HTTP interface for retrieving assets
    private func getAssetChunks(asset: Asset) : [Blob] {
        let assetChunks = Buffer.Buffer<Blob>(0);
        
        for (chunkId in asset.chunkIds.vals()) {
            switch (chunks.get(chunkId)) {
                case (null) { /* Skip */ };
                case (?chunk) { assetChunks.add(chunk.data); };
            };
        };
        
        Buffer.toArray(assetChunks);
    };
    
    private func concatenateBlobs(blobs: [Blob]) : Blob {
        if (blobs.size() == 0) {
            return Blob.fromArray([]);
        };
        
        let totalLength = Array.foldLeft<Blob, Nat>(
            blobs, 
            0, 
            func(acc, blob) { acc + blob.size() }
        );
        
        let result = Buffer.Buffer<Nat8>(totalLength);
        
        for (blob in blobs.vals()) {
            let bytes = Blob.toArray(blob);
            for (byte in bytes.vals()) {
                result.add(byte);
            };
        };
        
        Blob.fromArray(Buffer.toArray(result));
    };
    
    public query func http_request(request: HttpRequest) : async HttpResponse {
        let path = Iter.toArray(Text.split(request.url, #char '/'));
        
        if (path.size() >= 3 and path[1] == "asset") {
            let assetId = path[2];
            
            switch (assets.get(assetId)) {
                case (null) {
                    return {
                        body = Blob.fromArray([]);
                        headers = [("Content-Type", "text/plain")];
                        status_code = 404;
                        streaming_strategy = null;
                    };
                };
                case (?asset) {
                    let chunks = getAssetChunks(asset);
                    let body = concatenateBlobs(chunks);
                    
                    return {
                        body = body;
                        headers = [
                            ("Content-Type", asset.contentType),
                            ("Cache-Control", "public, max-age=15552000"),
                            ("Access-Control-Allow-Origin", "*")
                        ];
                        status_code = 200;
                        streaming_strategy = null;
                    };
                };
            };
        };
        
        // Default 404 response
        {
            body = Blob.fromArray([]);
            headers = [("Content-Type", "text/plain")];
            status_code = 404;
            streaming_strategy = null;
        };
    };
    
    // Admin functions
    public shared(msg) func deleteAsset(assetId: AssetId) : async Result.Result<(), Text> {
        let caller = msg.caller;
        
        switch (assets.get(assetId)) {
            case (null) {
                return #err("Asset not found");
            };
            case (?asset) {
                if (Principal.notEqual(caller, asset.owner)) {
                    return #err("Only the asset owner can delete the asset");
                };
                
                // Remove all chunks
                for (chunkId in asset.chunkIds.vals()) {
                    chunks.delete(chunkId);
                };
                
                // Remove the asset
                assets.delete(assetId);
                
                #ok(());
            };
        };
    };
    
    // System functions
    system func cycleBalance() : async Nat {
        Cycles.balance();
    };
    
    public func acceptCycles() : async () {
        let available = Cycles.available();
        let accepted = Cycles.accept(available);
    };
};
