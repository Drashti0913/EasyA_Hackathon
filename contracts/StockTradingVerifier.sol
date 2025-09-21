// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract StockTradingVerifier {
    address public owner;
    uint256 public tradingFee = 0.001 ether;
    
    mapping(string => bool) public supportedStocks;
    mapping(address => uint256) public userBalances;
    mapping(address => mapping(string => uint256)) public userStockHoldings;
    
    struct PriceData {
        uint256 price;
        uint256 timestamp;
        bool verified;
    }
    
    mapping(string => PriceData) public stockPrices;
    
    event StockPurchased(address indexed user, string symbol, uint256 quantity, uint256 price);
    event PriceUpdated(string symbol, uint256 price, uint256 timestamp);
    event BalanceDeposited(address indexed user, uint256 amount);
    
    constructor() {
        owner = msg.sender;
        supportedStocks["AAPL"] = true;
        supportedStocks["GOOGL"] = true;
        supportedStocks["MSFT"] = true;
        supportedStocks["TSLA"] = true;
        supportedStocks["AMZN"] = true;
        supportedStocks["NVDA"] = true;
    }
    
    function depositBalance() external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        userBalances[msg.sender] += msg.value;
        emit BalanceDeposited(msg.sender, msg.value);
    }
    
    function updateStockPrice(string memory symbol, uint256 price) external {
        require(supportedStocks[symbol], "Stock not supported");
        require(price > 0, "Price must be greater than 0");
        
        stockPrices[symbol] = PriceData({
            price: price,
            timestamp: block.timestamp,
            verified: true
        });
        
        emit PriceUpdated(symbol, price, block.timestamp);
    }
    
    function purchaseStock(string memory symbol, uint256 quantity) external payable returns (bool) {
        require(supportedStocks[symbol], "Stock not supported");
        require(quantity > 0, "Quantity must be greater than 0");
        
        PriceData memory priceData = stockPrices[symbol];
        require(priceData.verified, "Price not verified");
        
        uint256 totalCost = priceData.price * quantity + tradingFee;
        require(msg.value >= totalCost, "Insufficient payment");
        
        userStockHoldings[msg.sender][symbol] += quantity;
        
        emit StockPurchased(msg.sender, symbol, quantity, priceData.price);
        return true;
    }
    
    function getUserBalance(address user) external view returns (uint256) {
        return userBalances[user];
    }
    
    function getUserHoldings(address user, string memory symbol) external view returns (uint256) {
        return userStockHoldings[user][symbol];
    }
    
    receive() external payable {
        depositBalance();
    }
}