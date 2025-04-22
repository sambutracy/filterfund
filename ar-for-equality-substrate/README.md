# AR for Equality Substrate Backend

## Overview

The AR for Equality Substrate backend is designed to support the FilterFund AR platform by providing a robust blockchain infrastructure. This backend leverages the Substrate framework to create a decentralized application that manages campaigns, user profiles, and asset storage.

## Features

- **Campaign Management**: Create, update, and manage fundraising campaigns.
- **User Profiles**: Manage user data and authentication.
- **Asset Storage**: Store and retrieve assets related to campaigns and filters.

## Getting Started

### Prerequisites

- Rust (latest stable version)
- Cargo (Rust package manager)
- Substrate development environment

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ar-for-equality-substrate.git
   cd ar-for-equality-substrate
   ```

2. Build the project:
   ```bash
   cargo build --release
   ```

3. Run the node:
   ```bash
   cargo run --release --bin node
   ```

### Docker Setup

To run the project using Docker, ensure you have Docker installed and then run:
```bash
docker-compose up
```

## Project Structure

- **node/src**: Contains the main application logic for the Substrate node.
- **pallets**: Contains the various pallets for campaign management, user profiles, and asset storage.
- **runtime**: Defines the runtime logic and configuration for the blockchain.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Make your changes and commit them (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

## Contact

For any inquiries, please reach out to [your-email@example.com]. 

---

Made with ❤️ for social impact.