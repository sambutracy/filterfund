// filepath: c:\Users\Victor Sambu\ar-for-equality-substrate\pallets\campaign-management\src\weights.rs
#![cfg_attr(rustfmt, rustfmt_skip)]

use frame_support::weights::{Weight, IdentityFee};

pub trait WeightInfo {
    fn create_campaign() -> Weight;
    fn donate_to_campaign() -> Weight;
}

pub struct WeightInfoImpl;

impl WeightInfo for WeightInfoImpl {
    fn create_campaign() -> Weight {
        10_000_000 // Example weight for creating a campaign
    }

    fn donate_to_campaign() -> Weight {
        5_000 // Example weight for donating to a campaign
    }
}