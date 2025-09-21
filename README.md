# DeFi Multi-Asset Trading Platform

A decentralized finance (DeFi) trading platform that enables users to trade cryptocurrency, stocks, and precious metals using the Flare Network's FTSO (Flare Time Series Oracle) for real-time price data.

## Features

### Multi-Asset Trading
- **Cryptocurrency**: Bitcoin, Ethereum, Ripple, Cardano, Polkadot, Solana, Polygon, Avalanche
- **Stocks**: Apple, Google, Microsoft, Amazon, Tesla, Meta, Netflix, NVIDIA
- **Precious Metals**: Gold, Silver, Platinum, Palladium

### Core Functionality
- **Wallet Integration**: MetaMask wallet connection with Flare Coston2 testnet
- **Real-time Pricing**: FTSO-powered price feeds for all asset categories
- **Buy/Sell Trading**: Complete trading functionality with profit/loss tracking
- **Portfolio Management**: Track holdings, average prices, and performance
- **Transaction History**: Monitor all trading activities

### User Experience
- **Category Selection**: Interactive checkboxes for asset type filtering
- **Responsive Design**: Mobile-friendly interface with modern UI
- **Live Updates**: Auto-refresh market data every 30 seconds
- **Status Tracking**: Real-time transaction and connection status

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Blockchain**: Flare Network (Coston2 Testnet)
- **Web3**: Ethers.js v5.7.2
- **Wallet**: MetaMask integration
- **Oracle**: Flare Time Series Oracle (FTSO)

## Getting Started

### Prerequisites

1. **MetaMask Wallet**
   - Install MetaMask browser extension
   - Create or import a wallet
   - Switch to Flare Coston2 testnet

2. **Testnet Tokens**
   - Get free C2FLR tokens from [Coston2 Faucet](https://coston2-faucet.towolabs.com/)
   - Minimum 10 FLR recommended for testing

### Installation

1. **Clone the Repository**
```bash
   git clone https://github.com/your-username/defi-multi-asset-trading.git
   cd defi-multi-asset-trading
```
2.**Open the application**
- open index.html in a web browser
-or serve via a local web server:
```bash   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
```
3.**Connect your wallet**
-click " Connect MetaMask"
-  Approve network switch to coston 2
-  confirm wallet connection
    
### Usage Guide

1.**Wallet Connection**
- Click the "Connect MetaMask" button
- Approve the connection request
- The platform will automatically switch to Flare Coston2 testnet
- Your wallet address and balance will be displayed
  
2.**Asset Selection**
  - Select desired asset categories using checkboxes:
  - Cryptocurrency
  - Stocks
  -Precious metals
  - choose specific assets from ythe dropdown menu
  -Asset prices update automatically via FTSO
    
3.**Trading**
    - Toggle between "Buy" and "Sell" modes
    - Enter the quantity you want to trade
    - Review the price calculation and total cost
    - Click "Buy Assets" and "Sell Assets" to execute
    - Monitor transcation status in real-time

    
 4.**Portfolio Management**
 - View your holdings in portfolio section
 - Track profit/loss for each position
 - Monitor average purchase prices
 - See overall portfolio performance

### Network Configuration
**Flare Coston2 Testnet Details**
Network Name: Flare Testnet Coston2
RPC URL: https://coston2-api.flare.network/ext/C/rpc
Chain ID: 114 (0x72)
Currency Symbol: C2FLR
Block Explorer: https://coston2-explorer.flare.network/

### FTSO Integration 
The platform leverages Flare's Time Series Oracle for:

  1.Real-time price feeds across all asset categories
 
  2. Decentralized price discovery
  
  3. High-frequency price updates
    
  4.Cross-asset price correlations

### Supported FTSO Feeds

  -Crypto: BTC/USD, ETH/USD, XRP/USD, ADA/USD, DOT/USD, SOL/USD
 
  -Stocks: AAPL, GOOGL, MSFT, AMZN, TSLA, META, NFLX, NVDA
 
  -Metals: XAU/USD, XAG/USD, XPT/USD, XPD/USD

### Security Features

  -Client-side Only: No backend servers or databases
 
  -MetaMask Integration: Secure wallet connection
 
  -Testnet Environment: No real funds at risk
 
  -Transaction Verification: All trades verified on-chain
 
  -Network Validation: Automatic network switching

### File Structure
defi-multi-asset-trading/
│
├── index.html               # Main application file
├── README.md                # Project documentation
├── assets/
│   ├── images/              # UI images and icons
│   └── styles/              # Additional CSS files
└── docs/
    ├── API.md              # API documentation
    ├── DEPLOYMENT.md       # Deployment guide
    └── CONTRIBUTING.md     # Contribution guidelines

 ### Browser Compatibility 
 
  -Chrome: v90+
 
  -Firefox: v88+
 
  -Safari: v14+
 
  -Edge: v90+
 
  -Mobile: iOS Safari, Chrome Mobile

### Known Limitations

 -Testnet Only: Currently operates on Coston2 testnet

 -Mock Backend: Simulated API responses for demonstration

 -Limited Assets: Predefined set of tradeable assets
 
 -Demo Transactions: No actual blockchain transactions in current version

### Development Roadmap
 **Phase 1 (Current)**

 Multi-asset category selection
 FTSO price integration
 Basic trading interface
 Portfolio tracking

 **Phase 2 (Planned)**

 Real blockchain transactions
 Advanced charting
 Price alerts
 Trading history export

 **Phase 3 (Future)**

 Mainnet deployment
 Additional asset categories
 Advanced order types
 Social trading features
 
 ### Contributing

Fork the repository
Create a feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request

### Testing
**Manual Testing Checklist**

 Wallet connection/disconnection
 Asset category selection
 Buy/sell trade execution
 Portfolio updates
 Price refresh functionality
 Mobile responsiveness

### Test Coverage

Unit tests for trading logic
Integration tests for FTSO connectivity
E2E tests for user workflows
### Troubleshooting
**Common Issues**
**MetaMask Not Detected**

Ensure MetaMask extension is installed and enabled
Refresh the page and try again

**Network Switch Failed**

Manually add Coston2 network to MetaMask
Check network configuration details above

**Transaction Failed**

Verify sufficient C2FLR balance
Check network connectivity
Retry after a few seconds

**Price Data Not Loading**

Check FTSO network status
Refresh the application
Verify testnet connectivity

### License
This project is licensed under the MIT License - see the LICENSE file for details.
### Disclaimer
IMPORTANT: This is a testnet demonstration application. No real funds are involved. Do not send real cryptocurrency or attempt to trade with actual assets. This platform is for educational and testing purposes only.
### Support
For questions, issues, or contributions:

Create an issue on GitHub
Join our community discussions
Check the documentation in /docs

### Acknowledgments

Flare Network team for FTSO infrastructure
MetaMask for wallet integration
Ethers.js for blockchain connectivity
The DeFi community for inspiration
```






   
   

    
  


