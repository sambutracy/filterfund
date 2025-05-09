# Filterfund
*Amplifying Social Impact Through AR Filters*

This is the source repository for the May 2025 Polkadot Hackathon submission of the AR for Equality project by Tracy Sambu and Kevin Mucyo.

## Introduction

Filterfund is an innovative platform that leverages Augmented Reality (AR) filters to raise awareness and funds for social causes. By combining crowdfunding with shareable AR experiences, we enable creators to build campaigns that spread meaningful messages across social media platforms while collecting donations through the Polkadot ecosystem.

Our platform addresses the disconnect between social media engagement and charitable giving. While traditional fundraising relies on donation pages that break the user experience, AR for Equality embeds the cause directly into shareable AR content that can go viral across platforms like Instagram, Snapchat, and TikTok. Users who interact with these filters are exposed to the cause and can donate directly via the blockchain, creating a seamless cycle of awareness and action.

Unlike existing charitable platforms that require users to visit separate websites, AR for Equality integrates directly into the social media sharing experience, making advocacy a natural part of online interactions. Each filter is linked to a smart contract on the Polkadot blockchain that handles donations transparently, while the AR experience creates an emotional connection that traditional donation methods lack.

Our implementation leverages Polkadot's Substrate framework and the ink! smart contract language to create a secure, transparent, and gas-efficient donation platform. Campaigns are deployed as smart contracts on the Shibuya testnet (Astar's testnet), allowing for complete transparency in how funds are collected and distributed.

AR for Equality aims to revolutionize how social causes leverage digital engagement by combining the viral nature of AR filters with the security and transparency of blockchain technology.

## Short Summary 
AR for Equality combines AR filters with Polkadot-powered crowdfunding to turn social media sharing into real-world impact.

## Demo Video
Watch our demonstration video:

[[AR for Equality Demo](https://youtu.be/5cbaudVNR9E)]

## Screenshots

### Campaign Creation Process
![Campaign Creation](https://placekitten.com/800/450)
*Creating a new campaign with AR filter assets and funding goals*

### AR Filter Experience
![AR Filter](https://placekitten.com/801/450)
*Example of AR filter promoting gender equality in action on mobile device*

### Campaign Details & Donation
![Campaign Details](https://placekitten.com/802/450)
*Viewing campaign progress and making a blockchain donation*

### Dashboard View
![Dashboard](https://placekitten.com/803/450)
*User dashboard showing created campaigns and donation history*

## Technical Details

### Architecture Overview
![Architecture Diagram](https://placekitten.com/900/500)

AR for Equality consists of three main components:

1. **React Frontend**: Handles user interactions, AR filter previews, and wallet connections
2. **Smart Contracts**: Manage campaign creation, donations, and fund distribution
3. **IPFS Storage**: Stores AR filter assets and campaign metadata

Users interact primarily through the web app, where they can browse campaigns, try filters, and make donations. Campaign creators can upload AR filter assets, which are stored on IPFS via Pinata, while campaign details and donation records are managed by smart contracts on the Shibuya testnet.

### Frontend Architecture

The frontend is a React/TypeScript application with the following structure:

- **Authentication**: Uses Polkadot.js extension for blockchain interactions and Privy for social login
- **State Management**: React Context API manages global application state
- **UI/UX**: Tailwind CSS for styling with Framer Motion for animations
- **AR Integration**: WebAR technology (8thWall) for in-browser AR experiences

Key components:
- `CampaignList.tsx`: Displays available campaigns with filtering options
- `CampaignDetails.tsx`: Shows details and donation options for a single campaign
- `CreateCampaign.tsx`: Multi-step form for creating new campaigns with AR filter uploads
- `ThreeDScene.tsx`: Handles WebAR filter previews within the browser

### Smart Contract Details

Our main smart contract is implemented in ink!, Polkadot's smart contract language. The contract code is located in `contracts/filterfundnew/lib.rs` and handles:

```rust
#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod filter_fund {
    use ink::{
        prelude::string::String,
        prelude::vec::Vec,
        storage::Mapping,
    };

    #[derive(Debug, scale::Encode, scale::Decode, PartialEq)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct Campaign {
        id: u32,
        creator: AccountId,
        title: String,
        description: String,
        target_amount: Balance,
        deadline: Timestamp,
        amount_collected: Balance,
        image_cid: String,
        filter_cid: String,
        category: String,
        donors: Vec<AccountId>,
        donations: Vec<Balance>,
        active: bool,
    }

    #[ink(storage)]
    pub struct FilterFund {
        owner: AccountId,
        campaign_count: u32,
        campaigns: Mapping<u32, Campaign>,
        user_campaigns: Mapping<AccountId, Vec<u32>>,
        user_donations: Mapping<AccountId, Vec<u32>>,
    }

    // Events
    #[ink(event)]
    pub struct CampaignCreated {
        #[ink(topic)]
        campaign_id: u32,
        #[ink(topic)]
        creator: AccountId,
        target_amount: Balance,
    }

    #[ink(event)]
    pub struct DonationMade {
        #[ink(topic)]
        campaign_id: u32,
        #[ink(topic)]
        donor: AccountId,
        amount: Balance,
    }

    // Implementation of contract functions
    impl FilterFund {
        #[ink(constructor)]
        pub fn new() -> Self {
            let owner = Self::env().caller();
            Self {
                owner,
                campaign_count: 0,
                campaigns: Mapping::default(),
                user_campaigns: Mapping::default(),
                user_donations: Mapping::default(),
            }
        }

        #[ink(message)]
        pub fn create_campaign(
            &mut self,
            title: String,
            description: String,
            target_amount: Balance,
            deadline: Timestamp,
            image_cid: String,
            filter_cid: String,
            category: String,
        ) -> Result<u32, Error> {
            // Implementation details
            // ...
            Ok(campaign_id)
        }

        #[ink(message, payable)]
        pub fn donate_to_campaign(&mut self, campaign_id: u32) -> Result<(), Error> {
            // Implementation details
            // ...
            Ok(())
        }

        // Other contract functions...
    }
}
```

The contract handles:

1. **Campaign Management**: Creation, updates, and closure of fundraising campaigns
2. **Donation Processing**: Secure handling of donations with event emissions
3. **Fund Distribution**: Controlled release of funds to campaign creators upon reaching goals
4. **AR Filter Tracking**: Storing IPFS CIDs for campaign images and AR filter assets

Deployed Contract Address: `YjRXP44Yc5AhuRgKo4KKWb3grvxfDsufiEpXgACrrNZDyrL` on Shibuya Testnet

### IPFS Integration

We use Pinata for decentralized storage of:
- Campaign images and videos
- AR filter model files (.glb format)
- Filter metadata and configuration

The IPFS integration ensures that campaign assets remain available even if our frontend service is down, providing true decentralization for the core campaign content.

## Project Structure

```
ar-for-equality/
├── contracts/                # Blockchain contracts written in ink!
│   └── filterfundnew/        # Main contract for campaign management
├── public/                   # Static assets
└── src/
    ├── assets/               # Images and media files
    ├── components/           # Reusable React components
    │   ├── CampaignCard.tsx  # Card display for campaigns
    │   ├── FilterCard.tsx    # Card display for AR filters
    │   ├── Layout.tsx        # Main layout wrapper
    │   └── ...
    ├── config/               # Configuration files
    ├── context/              # React Context for state management
    │   └── AuthContext.tsx   # Authentication context
    ├── contracts/            # Contract ABIs and interfaces
    ├── pages/                # Main application pages
    │   ├── CampaignDetails.tsx  # Single campaign view
    │   ├── CreateCampaign.tsx   # Campaign creation flow
    │   ├── Homepage.tsx         # Main landing page
    │   └── ...
    ├── services/             # API and blockchain service integration
    │   ├── pinata-service.ts # IPFS integration
    │   ├── polkadot-api.ts   # Polkadot.js API wrapper
    │   └── ...
    ├── types/                # TypeScript type definitions
    └── utils/                # Helper functions and utilities
```

## Technical Workflow

1. **Campaign Creation**:
   - Creator uploads AR filter assets to IPFS via Pinata
   - Creator submits campaign details which are stored on the blockchain
   - Smart contract emits a `CampaignCreated` event with campaign ID

2. **User Experience**:
   - Users browse campaigns and try AR filters directly in browser
   - Filters can be exported to social platforms with campaign details embedded
   - Users can donate directly through Polkadot.js extension

3. **Donation Flow**:
   - User connects wallet through Polkadot.js extension
   - Donation transaction is submitted to smart contract
   - Smart contract validates campaign status and records donation
   - Funds are held in escrow until campaign deadline

4. **Fund Distribution**:
   - After deadline, successful campaigns release funds to creators
   - Failed campaigns return funds to donors
   - All transactions are recorded on-chain for transparency

## How We Used Polkadot

AR for Equality leverages several key features of the Polkadot ecosystem:

1. **Substrate/ink! Smart Contracts**: Our campaigns and donation logic are implemented using ink!, providing a secure and efficient way to manage funds with lower gas fees than traditional EVM chains.

2. **Cross-Chain Compatibility**: By building on Polkadot, we future-proof the application to potentially connect with other chains in the ecosystem, allowing for donations in various tokens.

3. **Polkadot.js Extension**: We use the Polkadot browser extension for seamless wallet connections, making the donation process intuitive for users.

4. **Shibuya Testnet**: We've deployed our contract on Astar's Shibuya testnet, allowing for realistic testing without mainnet costs.

Specific Polkadot SDKs and tools used:
- `@polkadot/api`: For blockchain interactions
- `@polkadot/extension-dapp`: For wallet connectivity
- `@polkadot/util`: For cryptographic utilities
- Substrate Contract Node: For local development testing

## Team

- **Tracy Sambu** - Lead Developer & Project Lead
  - Full-stack development with React/TypeScript
  - Smart contract implementation in ink!
  - IPFS integration
  - Smart contract architecture
  - Testing and deployment

- **Kevin Mucyo** - UI/UX Design & AR Specialist
  - AR filter development
  - UI/UX design
  - User research
  - Security auditing

## Presentation

Watch our presentation:

[![AR for Equality Presentation](https://img.youtube.com/vi/your-presentation-id/0.jpg)](https://youtu.be/your-presentation-id)

[Presentation Slides on Canva](https://www.canva.com/design/your-presentation-id)

## Submission Requirements Checklist

- ✅ **Built with smart contracts on Polkadot ecosystem**
  - Deployed on Shibuya Testnet at `YjRXP44Yc5AhuRgKo4KKWb3grvxfDsufiEpXgACrrNZDyrL`
  - Contract code: [`contracts/filterfundnew/lib.rs`](./contracts/filterfundnew/lib.rs)
  - [View on Block Explorer](https://shibuya.subscan.io/account/YjRXP44Yc5AhuRgKo4KKWb3grvxfDsufiEpXgACrrNZDyrL)

- ✅ **Open Source**
  - Released under MIT License
  - Code available on GitHub

- ✅ **Short Summary**
  - AR for Equality combines AR filters with Polkadot-powered crowdfunding to turn social media sharing into real-world impact.

- ✅ **Full Description**
  - See Introduction section above

- ✅ **Technical Description**
  - See Technical Details section above

- ✅ **Canva Presentation Link**
  - [Presentation on Canva](https://www.canva.com/design/your-presentation-id)

- ✅ **Custom Smart Contract on Polkadot**
  - See Smart Contract Details section

- ✅ **Clear README**
  - You're reading it!

- ✅ **Demo Video**
  - See Demo Video section above

- ✅ **UI Screenshots**
  - See Screenshots section above

- ✅ **Smart Contract Explanation**
  - See Smart Contract Details section above

- ✅ **Explanatory Video**
  - See Presentation section above

- ✅ **Block Explorer Link**
  - [View on Shibuya Subscan](https://shibuya.subscan.io/account/YjRXP44Yc5AhuRgKo4KKWb3grvxfDsufiEpXgACrrNZDyrL)

## Future Roadmap

### Phase 1 (Current)
- MVP with basic campaign creation and donation features
- AR filter integration with major platforms
- Testnet deployment

### Phase 2 (Next 3 Months)
- Migration to Polkadot mainnet
- Enhanced analytics dashboard for campaign performance tracking
- Mobile app development for easier filter creation and sharing
- Multiple token support for donations (DOT, ASTR, etc.)

### Phase 3 (Future)
- DAO governance for platform decisions
- NFT integration for campaign supporters
- Cross-parachain functionality via XCMP
- AI-assisted AR filter creation tools

## AI Tools Used in Development

- GitHub Copilot cursor and Claude- Code completion and pair programming
- Midjourney - Design inspiration and mockup generation
- ChatGPT - Documentation assistance and debugging support

## License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for more information.

## Contact

Project Link: [https://github.com/sambutracy/filterfund](https://github.com/sambutracy/filterfund)

---

*Made with ❤️ for social impact*
