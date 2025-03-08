# AR for Equality: Amplifying Social Impact Through AR Filters

## Project Overview

AR for Equality is an innovative platform that leverages Augmented Reality (AR) filters to raise awareness and funds for social causes. By combining crowdfunding with shareable AR experiences, we enable creators to build campaigns that spread meaningful messages across social media platforms.

### Key Features

- 🌍 Create AR Filter Campaigns
- 💸 Crowdfunding with Internet Computer Protocol (ICP)
- 🔗 Multi-Platform AR Filter Support (Snapchat, Instagram, TikTok)
- 🌈 Categories: Health, Education, Environment, Equality, and More

## SDG Impact

Our platform directly supports multiple UN Sustainable Development Goals:
- Goal 5: Gender Equality
- Goal 4: Quality Education
- Goal 10: Reduced Inequalities
- Goal 13: Climate Action

## Technical Architecture

### Backend (Internet Computer Protocol)
- 3 Core Canisters:
  1. **Campaign Canister**: Manages campaign creation, donations, and tracking
  2. **User Canister**: Handles user profiles and authentication
  3. **Asset Canister**: Manages file uploads for campaign and filter images

### Frontend (React)
- Web3 Authentication via Privy
- Dark/Light Mode Support
- Responsive Design
- Framer Motion Animations

## Prerequisites

- Node.js (v16+)
- Internet Computer SDK (dfx)
- Privy Developer Account
- Web3 Wallet (Recommended)

## Local Development Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/ar-for-equality.git
cd ar-for-equality
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
   - Create `.env.local` with:
     ```
     REACT_APP_PRIVY_APP_ID=your_privy_app_id
     ```

4. Start local Internet Computer replica
```bash
dfx start --clean --background
```

5. Deploy local canisters
```bash
dfx deploy
```

6. Start development server
```bash
npm start
```

## Deployment

- Local Development: `dfx deploy`
- Internet Computer Mainnet: `dfx deploy --network ic`

## Technology Stack

- Frontend: React, TypeScript
- Blockchain: Internet Computer Protocol
- Authentication: Privy
- State Management: React Context
- Styling: Tailwind CSS
- Animations: Framer Motion

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Project Link: [https://github.com/yourusername/ar-for-equality](https://github.com/yourusername/ar-for-equality)

---

Made with ❤️ for social impact