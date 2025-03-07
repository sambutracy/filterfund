// Asset Canister for handling file uploads (images)
import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
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
import Int "mo:base/Int";

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
    private stable var assetsArray: [(AssetId, Asset)] = [];
    private stable var chunksArray: [(ChunkId, AssetChunk)] = [];
    
    // Using simple storage instead of HashMap
    private var assets = HashMap.HashMap<AssetId, Asset>(
        0, Text.equal, Text.hash
    );
    
    // Using arrays for chunks instead of HashMap
    private var chunks: [var ?AssetChunk] = [var];
    
    // Initialize state from stable variables on upgrade
    system func preupgrade() {
        assetsArray := Iter.toArray(assets.entries());
        
        // Convert chunks array to stable storage
        let stableChunks = Buffer.Buffer<(ChunkId, AssetChunk)>(chunks.size());
        for (i in Iter.range(0, chunks.size() - 1)) {
            switch(chunks[i]) {
                case null { /* Skip */ };
                case (?chunk) { stableChunks.add((i, chunk)); };
            };
        };
        chunksArray := Buffer.toArray(stableChunks);
    };
    
    system func postupgrade() {
        assets := HashMap.fromIter<AssetId, Asset>(
            assetsArray.vals(), 10, Text.equal, Text.hash
        );
        
        // Determine the max chunk ID
        var maxChunkId: Nat = 0;
        for ((id, _) in chunksArray.vals()) {
            if (id > maxChunkId) {
                maxChunkId := id;
            };
        };
        
        // Initialize chunks array
        chunks := Array.init<?AssetChunk>(maxChunkId + 1, null);
        
        // Populate chunks array
        for ((id, chunk) in chunksArray.vals()) {
            chunks[id] := ?chunk;
        };
    };
    
    // Helper function to convert Int to Text
    private func intToText(n: Int) : Text {
        var text = "";
        var value = n;
        
        if (value == 0) {
            return "0";
        };
        
        if (value < 0) {
            text := "-";
            value := -value;
        };
        
        var digits = "";
        while (value > 0) {
            let digit = value % 10;
            // Convert digit to character and prepend to digits string
            switch (digit) {
                case 0 { digits := "0" # digits; };
                case 1 { digits := "1" # digits; };
                case 2 { digits := "2" # digits; };
                case 3 { digits := "3" # digits; };
                case 4 { digits := "4" # digits; };
                case 5 { digits := "5" # digits; };
                case 6 { digits := "6" # digits; };
                case 7 { digits := "7" # digits; };
                case 8 { digits := "8" # digits; };
                case 9 { digits := "9" # digits; };
                case _ { /* Not possible */ };
            };
            value := value / 10;
        };
        
        return text # digits;
    };
    
    // Helper functions
    private func generateAssetId(principal: Principal, filename: Text, timestamp: Int) : AssetId {
        let principalText = Principal.toText(principal);
        let timestampText = intToText(timestamp);
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
    
    // Helper function to get a chunk
    private func getChunk(id: ChunkId) : ?AssetChunk {
        if (id >= chunks.size()) {
            return null;
        };
        return chunks[id];
    };
    
    // Helper function to store a chunk
    private func storeChunk(chunk: AssetChunk) : () {
        let id = chunk.id;
        if (id >= chunks.size()) {
            // Resize the array if needed
            let newSize = id + 10; // Add some buffer space
            let newArray = Array.init<?AssetChunk>(newSize, null);
            for (i in Iter.range(0, chunks.size() - 1)) {
                newArray[i] := chunks[i];
            };
            chunks := newArray;
        };
        chunks[id] := ?chunk;
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
                
                // Store the chunk
                storeChunk(chunk);
                
                // Update the asset's chunk IDs
                let chunkIdsBuffer = Buffer.Buffer<ChunkId>(asset.chunkIds.size() + 1);
                for (id in asset.chunkIds.vals()) {
                    chunkIdsBuffer.add(id);
                };
                chunkIdsBuffer.add(chunkId);
                
                let updatedAsset = {
                    asset with
                    chunkIds = Buffer.toArray(chunkIdsBuffer);
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
                
                // Return the asset URL - using hardcoded canister ID for simplicity
                let assetUrl = "http://bkyz2-fmaaa-aaaaa-qaaaq-cai.raw.ic0.app/asset/" # assetId;
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
            switch (getChunk(chunkId)) {
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
                    if (chunkId < chunks.size()) {
                        chunks[chunkId] := null;
                    };
                };
                
                // Remove the asset
                assets.delete(assetId);
                
                #ok(());
            };
        };
    };
    
    // System functions
    public func acceptCycles() : async () {
        let available = Cycles.available();
        let accepted = Cycles.accept(available);
    };
};