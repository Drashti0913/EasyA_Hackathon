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
    ```
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
```
### FTSO Integration 



   
   

    
  


