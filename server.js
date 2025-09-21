// // Complete server.js with MongoDB integration and proper error handling
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');
// const axios = require('axios');
// const path = require('path');
// const mongoose = require('mongoose');

// const app = express();

// // Database connection with retry logic
// const connectDB = async () => {
//     try {
//         const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/defi_trading';
//         console.log('Connecting to MongoDB:', mongoURI);

//         const conn = await mongoose.connect(mongoURI, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         });

//         console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
//         return conn;
//     } catch (error) {
//         console.error('❌ MongoDB connection error:', error.message);
//         console.log('Retrying connection in 5 seconds...');
//         setTimeout(connectDB, 5000);
//     }
// };

// // User Schema with enhanced validation
// const userSchema = new mongoose.Schema({
//     walletAddress: {
//         type: String,
//         required: true,
//         unique: true,
//         trim: true,
//         lowercase: true,
//         validate: {
//             validator: function (v) {
//                 return /^0x[a-fA-F0-9]{40}$/.test(v);
//             },
//             message: 'Invalid wallet address format'
//         }
//     },
//     balance: {
//         type: Number,
//         default: 1000,
//         min: 0
//     },
//     portfolio: [{
//         symbol: {
//             type: String,
//             required: true,
//             uppercase: true
//         },
//         quantity: {
//             type: Number,
//             required: true,
//             min: 0
//         },
//         averagePrice: {
//             type: Number,
//             required: true,
//             min: 0
//         },
//         totalInvested: {
//             type: Number,
//             required: true,
//             min: 0
//         },
//         purchaseDate: {
//             type: Date,
//             default: Date.now
//         }
//     }],
//     tradingHistory: [{
//         type: {
//             type: String,
//             enum: ['buy', 'sell'],
//             required: true
//         },
//         symbol: {
//             type: String,
//             required: true,
//             uppercase: true
//         },
//         quantity: {
//             type: Number,
//             required: true,
//             min: 0
//         },
//         price: {
//             type: Number,
//             required: true,
//             min: 0
//         },
//         totalAmount: {
//             type: Number,
//             required: true,
//             min: 0
//         },
//         timestamp: {
//             type: Date,
//             default: Date.now
//         },
//         transactionHash: {
//             type: String,
//             required: true
//         },
//         status: {
//             type: String,
//             enum: ['pending', 'completed', 'failed'],
//             default: 'completed'
//         }
//     }],
//     lastLogin: {
//         type: Date,
//         default: Date.now
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now
//     },
//     isActive: {
//         type: Boolean,
//         default: true
//     },
//     totalTrades: {
//         type: Number,
//         default: 0
//     },
//     totalVolume: {
//         type: Number,
//         default: 0
//     }
// }, {
//     timestamps: true
// });

// // Indexes for better performance
// userSchema.index({ walletAddress: 1 });
// userSchema.index({ 'portfolio.symbol': 1 });
// userSchema.index({ 'tradingHistory.timestamp': -1 });
// userSchema.index({ lastLogin: -1 });

// // Instance methods
// userSchema.methods.updateBalance = function (amount) {
//     this.balance += amount;
//     if (this.balance < 0) this.balance = 0;
//     return this.save();
// };

// userSchema.methods.addTrade = function (tradeData) {
//     this.tradingHistory.push(tradeData);
//     this.totalTrades += 1;
//     this.totalVolume += tradeData.totalAmount;
//     return this.save();
// };

// userSchema.methods.updatePortfolio = function (symbol, quantity, price, type) {
//     const existingHolding = this.portfolio.find(h => h.symbol === symbol);

//     if (existingHolding) {
//         if (type === 'buy') {
//             const newTotalInvested = existingHolding.totalInvested + (quantity * price);
//             const newQuantity = existingHolding.quantity + quantity;
//             existingHolding.averagePrice = newTotalInvested / newQuantity;
//             existingHolding.quantity = newQuantity;
//             existingHolding.totalInvested = newTotalInvested;
//         } else if (type === 'sell') {
//             existingHolding.quantity -= quantity;
//             if (existingHolding.quantity <= 0) {
//                 this.portfolio = this.portfolio.filter(h => h.symbol !== symbol);
//             } else {
//                 existingHolding.totalInvested = existingHolding.quantity * existingHolding.averagePrice;
//             }
//         }
//     } else if (type === 'buy') {
//         this.portfolio.push({
//             symbol,
//             quantity,
//             averagePrice: price,
//             totalInvested: quantity * price,
//             purchaseDate: new Date()
//         });
//     }

//     return this.save();
// };

// const User = mongoose.model('User', userSchema);

// // Security middleware
// app.use(helmet({
//     contentSecurityPolicy: false,
//     crossOriginEmbedderPolicy: false
// }));

// // Rate limiting
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, // limit each IP to 100 requests per windowMs
//     message: { error: 'Too many requests from this IP' },
//     standardHeaders: true,
//     legacyHeaders: false,
// });
// app.use('/api/', limiter);

// app.use(cors({
//     origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001'],
//     credentials: true
// }));

// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Serve static files
// app.use(express.static(path.join(__dirname, 'public')));

// // Cache for API data
// let priceCache = {
//     data: null,
//     timestamp: 0,
//     TTL: 30000 // 30 seconds cache
// };

// // Fetch real crypto prices from CoinGecko
// async function fetchRealPrices() {
//     try {
//         if (priceCache.data && Date.now() - priceCache.timestamp < priceCache.TTL) {
//             return priceCache.data;
//         }

//         console.log('Fetching real prices from CoinGecko...');

//         const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
//             params: {
//                 ids: 'bitcoin,ethereum,ripple,cardano,polkadot,solana',
//                 vs_currencies: 'usd',
//                 include_24hr_change: true,
//                 include_24hr_vol: true
//             },
//             timeout: 5000
//         });

//         const data = response.data;

//         const stocks = [
//             {
//                 symbol: 'BTC',
//                 name: 'Bitcoin',
//                 price: data.bitcoin?.usd || 43000,
//                 change: data.bitcoin?.usd_24h_change || 0,
//                 volume: data.bitcoin?.usd_24h_vol || 1000000000
//             },
//             {
//                 symbol: 'ETH',
//                 name: 'Ethereum',
//                 price: data.ethereum?.usd || 2600,
//                 change: data.ethereum?.usd_24h_change || 0,
//                 volume: data.ethereum?.usd_24h_vol || 500000000
//             },
//             {
//                 symbol: 'XRP',
//                 name: 'XRP',
//                 price: data.ripple?.usd || 0.60,
//                 change: data.ripple?.usd_24h_change || 0,
//                 volume: data.ripple?.usd_24h_vol || 200000000
//             },
//             {
//                 symbol: 'ADA',
//                 name: 'Cardano',
//                 price: data.cardano?.usd || 0.45,
//                 change: data.cardano?.usd_24h_change || 0,
//                 volume: data.cardano?.usd_24h_vol || 150000000
//             },
//             {
//                 symbol: 'DOT',
//                 name: 'Polkadot',
//                 price: data.polkadot?.usd || 7.50,
//                 change: data.polkadot?.usd_24h_change || 0,
//                 volume: data.polkadot?.usd_24h_vol || 100000000
//             },
//             {
//                 symbol: 'SOL',
//                 name: 'Solana',
//                 price: data.solana?.usd || 95.00,
//                 change: data.solana?.usd_24h_change || 0,
//                 volume: data.solana?.usd_24h_vol || 300000000
//             }
//         ];

//         priceCache.data = stocks;
//         priceCache.timestamp = Date.now();

//         console.log('✅ Prices updated successfully');
//         return stocks;

//     } catch (error) {
//         console.error('Error fetching real prices:', error.message);
//         return getFallbackPrices();
//     }
// }

// // Fallback prices
// function getFallbackPrices() {
//     console.log('Using fallback prices...');

//     const baseData = {
//         'BTC': { price: 43250.75, name: 'Bitcoin' },
//         'ETH': { price: 2680.50, name: 'Ethereum' },
//         'XRP': { price: 0.6234, name: 'XRP' },
//         'ADA': { price: 0.4567, name: 'Cardano' },
//         'DOT': { price: 7.89, name: 'Polkadot' },
//         'SOL': { price: 98.76, name: 'Solana' }
//     };

//     return Object.keys(baseData).map(symbol => {
//         const base = baseData[symbol];
//         const fluctuation = (Math.random() - 0.5) * 0.05;
//         const currentPrice = base.price * (1 + fluctuation);
//         const change = fluctuation * 100;

//         return {
//             symbol,
//             name: base.name,
//             price: currentPrice,
//             change: change,
//             volume: 1000000000 * Math.random(),
//             timestamp: Date.now(),
//             source: 'fallback'
//         };
//     });
// }

// // API Routes

// // Health check
// app.get('/api/health', async (req, res) => {
//     try {
//         const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
//         const userCount = await User.countDocuments();

//         res.json({
//             status: 'healthy',
//             timestamp: new Date().toISOString(),
//             services: {
//                 server: 'running',
//                 database: dbStatus,
//                 users: userCount,
//                 cache: priceCache.data ? 'active' : 'empty'
//             }
//         });
//     } catch (error) {
//         res.status(500).json({
//             status: 'unhealthy',
//             error: error.message
//         });
//     }
// });

// // User registration
// app.post('/api/user/register', async (req, res) => {
//     try {
//         const { walletAddress } = req.body;

//         if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
//             return res.status(400).json({ error: 'Invalid wallet address format' });
//         }

//         // Check if user already exists
//         let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

//         if (user) {
//             return res.status(400).json({ error: 'User already exists' });
//         }

//         // Create new user
//         user = new User({
//             walletAddress: walletAddress.toLowerCase(),
//             balance: 1000 + Math.random() * 500 // Starting balance
//         });

//         await user.save();
//         console.log('✅ New user registered:', walletAddress);

//         res.status(201).json({
//             message: 'User registered successfully',
//             user: {
//                 walletAddress: user.walletAddress,
//                 balance: user.balance,
//                 createdAt: user.createdAt
//             }
//         });

//     } catch (error) {
//         console.error('❌ User registration error:', error);
//         res.status(500).json({ error: 'Failed to register user' });
//     }
// });

// // Get user data
// app.get('/api/user/:walletAddress', async (req, res) => {
//     try {
//         const { walletAddress } = req.params;

//         if (!/^0x[a-fA-F0-9]{40}$/i.test(walletAddress)) {
//             return res.status(400).json({ error: 'Invalid wallet address format' });
//         }

//         const user = await User.findOne({
//             walletAddress: walletAddress.toLowerCase(),
//             isActive: true
//         }).select('-__v');

//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         // Update last login
//         user.lastLogin = new Date();
//         await user.save();

//         res.json({
//             user: {
//                 walletAddress: user.walletAddress,
//                 balance: user.balance,
//                 portfolio: user.portfolio,
//                 totalTrades: user.totalTrades,
//                 totalVolume: user.totalVolume,
//                 lastLogin: user.lastLogin,
//                 createdAt: user.createdAt
//             }
//         });

//     } catch (error) {
//         console.error('❌ User fetch error:', error);
//         res.status(500).json({ error: 'Failed to fetch user data' });
//     }
// });

// // Get user portfolio
// app.get('/api/user/:walletAddress/portfolio', async (req, res) => {
//     try {
//         const { walletAddress } = req.params;

//         const user = await User.findOne({
//             walletAddress: walletAddress.toLowerCase(),
//             isActive: true
//         }).select('portfolio balance');

//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         // Calculate current portfolio value
//         let portfolioValue = 0;
//         const stocks = await fetchRealPrices();

//         for (const holding of user.portfolio) {
//             const stock = stocks.find(s => s.symbol === holding.symbol);
//             if (stock) {
//                 portfolioValue += holding.quantity * stock.price;
//             } else {
//                 portfolioValue += holding.quantity * holding.averagePrice;
//             }
//         }

//         res.json({
//             portfolio: user.portfolio,
//             balance: user.balance,
//             totalValue: portfolioValue,
//             cashValue: user.balance,
//             totalPortfolioValue: portfolioValue + user.balance,
//             lastUpdated: new Date()
//         });

//     } catch (error) {
//         console.error('❌ Portfolio fetch error:', error);
//         res.status(500).json({ error: 'Failed to fetch portfolio' });
//     }
// });

// // Get trading history
// app.get('/api/user/:walletAddress/history', async (req, res) => {
//     try {
//         const { walletAddress } = req.params;
//         const { limit = 50, page = 1 } = req.query;

//         const user = await User.findOne({
//             walletAddress: walletAddress.toLowerCase(),
//             isActive: true
//         }).select('tradingHistory');

//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         const skip = (page - 1) * limit;
//         const history = user.tradingHistory
//             .sort((a, b) => b.timestamp - a.timestamp)
//             .slice(skip, skip + parseInt(limit));

//         res.json({
//             history,
//             pagination: {
//                 page: parseInt(page),
//                 limit: parseInt(limit),
//                 total: user.tradingHistory.length,
//                 pages: Math.ceil(user.tradingHistory.length / limit)
//             }
//         });

//     } catch (error) {
//         console.error('❌ History fetch error:', error);
//         res.status(500).json({ error: 'Failed to fetch trading history' });
//     }
// });

// // Get stock prices
// app.get('/api/stocks', async (req, res) => {
//     try {
//         const stocks = await fetchRealPrices();
//         res.json({
//             stocks,
//             source: priceCache.data ? 'coingecko_api' : 'fallback',
//             timestamp: new Date().toISOString(),
//             cached: Date.now() - priceCache.timestamp < priceCache.TTL
//         });
//     } catch (error) {
//         console.error('❌ Error fetching stocks:', error);
//         res.status(500).json({ error: 'Failed to fetch stock data' });
//     }
// });

// // Get specific stock price
// app.get('/api/stock/:symbol/price', async (req, res) => {
//     try {
//         const { symbol } = req.params;
//         const stocks = await fetchRealPrices();
//         const stock = stocks.find(s => s.symbol.toLowerCase() === symbol.toLowerCase());

//         if (!stock) {
//             return res.status(404).json({ error: 'Stock not found' });
//         }

//         res.json({
//             symbol: stock.symbol,
//             name: stock.name,
//             price: stock.price,
//             change: stock.change,
//             timestamp: Date.now(),
//             source: priceCache.data ? 'coingecko_api' : 'fallback'
//         });
//     } catch (error) {
//         console.error('❌ Error fetching price:', error);
//         res.status(500).json({ error: 'Failed to fetch price' });
//     }
// });

// // Verify wallet balance
// app.post('/api/verify-balance', async (req, res) => {
//     try {
//         const { walletAddress } = req.body;

//         if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/i.test(walletAddress)) {
//             return res.status(400).json({ error: 'Invalid wallet address' });
//         }

//         // Find or create user
//         let user = await User.findOne({
//             walletAddress: walletAddress.toLowerCase()
//         });

//         if (!user) {
//             // Create new user
//             user = new User({
//                 walletAddress: walletAddress.toLowerCase(),
//                 balance: 1000 + Math.random() * 500
//             });
//             await user.save();
//             console.log('✅ New user created during balance verification:', walletAddress);
//         } else {
//             // Update last login
//             user.lastLogin = new Date();
//             await user.save();
//         }

//         res.json({
//             address: user.walletAddress,
//             balance: user.balance,
//             currency: 'FLR',
//             network: 'coston2',
//             isNewUser: user.createdAt > new Date(Date.now() - 60000) // Created in last minute
//         });

//     } catch (error) {
//         console.error('❌ Error verifying balance:', error);
//         res.status(500).json({ error: 'Failed to verify balance' });
//     }
// });

// // Execute trade - MAIN TRADING FUNCTION
// app.post('/api/execute-trade', async (req, res) => {
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//         const { walletAddress, symbol, quantity, pricePerShare } = req.body;

//         // Validation
//         if (!walletAddress || !symbol || !quantity || !pricePerShare) {
//             await session.abortTransaction();
//             return res.status(400).json({ error: 'Missing required fields' });
//         }

//         if (!/^0x[a-fA-F0-9]{40}$/i.test(walletAddress)) {
//             await session.abortTransaction();
//             return res.status(400).json({ error: 'Invalid wallet address format' });
//         }

//         if (quantity <= 0 || pricePerShare <= 0) {
//             await session.abortTransaction();
//             return res.status(400).json({ error: 'Quantity and price must be positive' });
//         }

//         // Find user
//         const user = await User.findOne({
//             walletAddress: walletAddress.toLowerCase(),
//             isActive: true
//         }).session(session);

//         if (!user) {
//             await session.abortTransaction();
//             return res.status(404).json({ error: 'User not found' });
//         }

//         const totalCost = quantity * pricePerShare;

//         // Check balance
//         if (user.balance < totalCost) {
//             await session.abortTransaction();
//             return res.status(400).json({
//                 error: 'Insufficient balance',
//                 required: totalCost,
//                 available: user.balance
//             });
//         }

//         // Verify current price (within 5% tolerance)
//         const stocks = await fetchRealPrices();
//         const currentStock = stocks.find(s => s.symbol.toLowerCase() === symbol.toLowerCase());

//         if (currentStock) {
//             const priceDifference = Math.abs(currentStock.price - pricePerShare) / currentStock.price;
//             if (priceDifference > 0.05) { // 5% tolerance
//                 await session.abortTransaction();
//                 return res.status(400).json({
//                     error: 'Price has changed significantly',
//                     currentPrice: currentStock.price,
//                     requestedPrice: pricePerShare
//                 });
//             }
//         }

//         // Generate transaction hash
//         const transactionHash = '0x' + Array.from({ length: 64 }, () =>
//             Math.floor(Math.random() * 16).toString(16)).join('');

//         // Update user balance
//         await user.updateBalance(-totalCost);

//         // Update portfolio
//         await user.updatePortfolio(symbol.toUpperCase(), quantity, pricePerShare, 'buy');

//         // Add to trading history
//         await user.addTrade({
//             type: 'buy',
//             symbol: symbol.toUpperCase(),
//             quantity: quantity,
//             price: pricePerShare,
//             totalAmount: totalCost,
//             timestamp: new Date(),
//             transactionHash: transactionHash,
//             status: 'completed'
//         });

//         await session.commitTransaction();

//         console.log(`✅ Trade executed: ${quantity} ${symbol} for ${totalCost} by ${walletAddress}`);

//         res.json({
//             success: true,
//             transactionId: transactionHash,
//             message: 'Trade executed successfully',
//             details: {
//                 symbol: symbol.toUpperCase(),
//                 quantity: quantity,
//                 pricePerShare: pricePerShare,
//                 totalCost: totalCost,
//                 newBalance: user.balance,
//                 timestamp: new Date().toISOString()
//             }
//         });

//     } catch (error) {
//         await session.abortTransaction();
//         console.error('❌ Trade execution error:', error);
//         res.status(500).json({
//             error: 'Trade execution failed',
//             message: error.message
//         });
//     } finally {
//         session.endSession();
//     }
// });

// // FTSO info endpoint
// app.get('/api/ftso/info', (req, res) => {
//     res.json({
//         registryAddress: '0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019',
//         supportedSymbols: ['BTC', 'ETH', 'XRP', 'ADA', 'DOT', 'SOL'],
//         network: 'Coston2 Testnet',
//         totalFeeds: 6,
//         status: 'active',
//         lastUpdate: new Date().toISOString()
//     });
// });

// // Get platform statistics
// app.get('/api/stats', async (req, res) => {
//     try {
//         const totalUsers = await User.countDocuments({ isActive: true });
//         const totalTrades = await User.aggregate([
//             { $match: { isActive: true } },
//             { $group: { _id: null, total: { $sum: '$totalTrades' } } }
//         ]);

//         const totalVolume = await User.aggregate([
//             { $match: { isActive: true } },
//             { $group: { _id: null, total: { $sum: '$totalVolume' } } }
//         ]);

//         res.json({
//             totalUsers,
//             totalTrades: totalTrades[0]?.total || 0,
//             totalVolume: totalVolume[0]?.total || 0,
//             timestamp: new Date().toISOString()
//         });
//     } catch (error) {
//         console.error('❌ Stats error:', error);
//         res.status(500).json({ error: 'Failed to fetch statistics' });
//     }
// });

// // Serve main page
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// // 404 handler
// app.use((req, res) => {
//     res.status(404).json({ error: 'Endpoint not found' });
// });

// // Error handler
// app.use((error, req, res, next) => {
//     console.error('❌ Unhandled error:', error);
//     res.status(500).json({
//         error: 'Internal server error',
//         message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
//     });
// });

// // Start server
// const PORT = process.env.PORT || 3001;

// // Connect to database and start server
// connectDB().then(() => {
//     app.listen(PORT, () => {
//         console.log(`🚀 Server running on http://localhost:${PORT}`);
//         console.log(`✅ Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
//         console.log(`📊 API Endpoints:`);
//         console.log(`   - GET  /api/health`);
//         console.log(`   - POST /api/user/register`);
//         console.log(`   - GET  /api/user/:address`);
//         console.log(`   - POST /api/execute-trade`);
//         console.log(`   - GET  /api/stocks`);
//         console.log(`💾 Database integration: ACTIVE`);
//         console.log(`🔄 Auto-refresh: 30 seconds`);
//     });
// }).catch(error => {
//     console.error('❌ Failed to start server:', error);
//     process.exit(1);
// });

// // Graceful shutdown
// process.on('SIGINT', async () => {
//     console.log('\n🛑 Shutting down gracefully...');
//     try {
//         await mongoose.connection.close();
//         console.log('✅ Database connection closed');
//         process.exit(0);
//     } catch (error) {
//         console.error('❌ Error during shutdown:', error);
//         process.exit(1);
//     }
// });

// // Handle unhandled promise rejections
// process.on('unhandledRejection', (err, promise) => {
//     console.error('❌ Unhandled Promise Rejection:', err.message);
//     console.error('Promise:', promise);
// });

// module.exports = app;

// Complete server.js with MongoDB integration, AI Recommendations, and Real API Integration
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// Database connection with retry logic
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/defi_trading';
        console.log('Connecting to MongoDB:', mongoURI);

        const conn = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
};

// User Schema with enhanced validation
const userSchema = new mongoose.Schema({
    walletAddress: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function (v) {
                return /^0x[a-fA-F0-9]{40}$/.test(v);
            },
            message: 'Invalid wallet address format'
        }
    },
    balance: {
        type: Number,
        default: 1000,
        min: 0
    },
    portfolio: [{
        symbol: {
            type: String,
            required: true,
            uppercase: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 0
        },
        averagePrice: {
            type: Number,
            required: true,
            min: 0
        },
        totalInvested: {
            type: Number,
            required: true,
            min: 0
        },
        purchaseDate: {
            type: Date,
            default: Date.now
        }
    }],
    tradingHistory: [{
        type: {
            type: String,
            enum: ['buy', 'sell'],
            required: true
        },
        symbol: {
            type: String,
            required: true,
            uppercase: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 0
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        transactionHash: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'completed'
        }
    }],
    lastLogin: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    totalTrades: {
        type: Number,
        default: 0
    },
    totalVolume: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes for better performance
userSchema.index({ walletAddress: 1 });
userSchema.index({ 'portfolio.symbol': 1 });
userSchema.index({ 'tradingHistory.timestamp': -1 });
userSchema.index({ lastLogin: -1 });

// Instance methods
userSchema.methods.updateBalance = function (amount) {
    this.balance += amount;
    if (this.balance < 0) this.balance = 0;
    return this.save();
};

userSchema.methods.addTrade = function (tradeData) {
    this.tradingHistory.push(tradeData);
    this.totalTrades += 1;
    this.totalVolume += tradeData.totalAmount;
    return this.save();
};
userSchema.methods.addTrade = function (tradeData) {
    this.tradingHistory.push(tradeData);
    this.totalTrades += 1;
    this.totalVolume += tradeData.totalAmount;
    // Add this line to track profit/loss
    if (tradeData.profitLoss) {
        this.totalProfit = (this.totalProfit || 0) + tradeData.profitLoss;
    }
    return this.save();
};

userSchema.methods.updatePortfolio = function (symbol, quantity, price, type) {
    const existingHolding = this.portfolio.find(h => h.symbol === symbol);

    if (existingHolding) {
        if (type === 'buy') {
            const newTotalInvested = existingHolding.totalInvested + (quantity * price);
            const newQuantity = existingHolding.quantity + quantity;
            existingHolding.averagePrice = newTotalInvested / newQuantity;
            existingHolding.quantity = newQuantity;
            existingHolding.totalInvested = newTotalInvested;
        } else if (type === 'sell') {
            existingHolding.quantity -= quantity;
            if (existingHolding.quantity <= 0) {
                this.portfolio = this.portfolio.filter(h => h.symbol !== symbol);
            } else {
                existingHolding.totalInvested = existingHolding.quantity * existingHolding.averagePrice;
            }
        }
    } else if (type === 'buy') {
        this.portfolio.push({
            symbol,
            quantity,
            averagePrice: price,
            totalInvested: quantity * price,
            purchaseDate: new Date()
        });
    }

    return this.save();
};

const User = mongoose.model('User', userSchema);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests from this IP' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

app.use(cors({
    origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Cache for API data
let priceCache = {
    data: null,
    timestamp: 0,
    TTL: 30000 // 30 seconds cache
};
// Execute SELL trade - ADD THIS ENDPOINT
app.post('/api/execute-sell', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { walletAddress, symbol, quantity, pricePerShare } = req.body;

        if (!walletAddress || !symbol || !quantity || !pricePerShare) {
            await session.abortTransaction();
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!/^0x[a-fA-F0-9]{40}$/i.test(walletAddress)) {
            await session.abortTransaction();
            return res.status(400).json({ error: 'Invalid wallet address format' });
        }

        if (quantity <= 0 || pricePerShare <= 0) {
            await session.abortTransaction();
            return res.status(400).json({ error: 'Quantity and price must be positive' });
        }

        const user = await User.findOne({
            walletAddress: walletAddress.toLowerCase(),
            isActive: true
        }).session(session);

        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if user has enough shares to sell
        const holding = user.portfolio.find(h => h.symbol === symbol.toUpperCase());
        
        if (!holding || holding.quantity < quantity) {
            await session.abortTransaction();
            return res.status(400).json({ 
                error: `Insufficient shares. You have ${holding ? holding.quantity : 0} shares of ${symbol}` 
            });
        }

        // Verify current price
        const stocks = await fetchRealPrices();
        const currentStock = stocks.find(s => s.symbol.toLowerCase() === symbol.toLowerCase());

        if (currentStock) {
            const priceDifference = Math.abs(currentStock.price - pricePerShare) / currentStock.price;
            if (priceDifference > 0.05) {
                await session.abortTransaction();
                return res.status(400).json({
                    error: 'Price has changed significantly',
                    currentPrice: currentStock.price,
                    requestedPrice: pricePerShare
                });
            }
        }

        // Calculate profit/loss
        const totalProceeds = quantity * pricePerShare;
        const avgPurchasePrice = holding.averagePrice;
        const profitLoss = (pricePerShare - avgPurchasePrice) * quantity;
        const profitLossPercentage = avgPurchasePrice > 0 ? 
            ((pricePerShare - avgPurchasePrice) / avgPurchasePrice * 100) : 0;

        // Generate transaction hash
        const transactionHash = '0x' + Array.from({ length: 64 }, () =>
            Math.floor(Math.random() * 16).toString(16)).join('');

        // Update user balance (add proceeds)
        await user.updateBalance(totalProceeds);

        // Update portfolio (remove shares)
        await user.updatePortfolio(symbol.toUpperCase(), quantity, pricePerShare, 'sell');

        // Add to trading history with profit/loss
        await user.addTrade({
            type: 'sell',
            symbol: symbol.toUpperCase(),
            quantity: quantity,
            price: pricePerShare,
            totalAmount: totalProceeds,
            profitLoss: profitLoss,
            timestamp: new Date(),
            transactionHash: transactionHash,
            status: 'completed'
        });

        await session.commitTransaction();

        console.log(`✅ Sell trade executed: ${quantity} ${symbol} for ${totalProceeds} (P/L: ${profitLoss.toFixed(2)}) by ${walletAddress}`);

        res.json({
            success: true,
            transactionId: transactionHash,
            message: 'Sell trade executed successfully',
            details: {
                type: 'sell',
                symbol: symbol.toUpperCase(),
                quantity: quantity,
                pricePerShare: pricePerShare,
                totalProceeds: totalProceeds,
                avgPurchasePrice: avgPurchasePrice,
                profitLoss: profitLoss,
                profitLossPercentage: profitLossPercentage,
                newBalance: user.balance,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('❌ Sell trade execution error:', error);
        res.status(500).json({
            error: 'Sell trade execution failed',
            message: error.message
        });
    } finally {
        session.endSession();
    }
});

// Fetch real crypto prices from CoinGecko
async function fetchRealPrices() {
    try {
        if (priceCache.data && Date.now() - priceCache.timestamp < priceCache.TTL) {
            return priceCache.data;
        }

        console.log('Fetching real prices from CoinGecko...');

        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
            params: {
                ids: 'bitcoin,ethereum,ripple,cardano,polkadot,solana',
                vs_currencies: 'usd',
                include_24hr_change: true,
                include_24hr_vol: true
            },
            timeout: 5000
        });

        const data = response.data;

        const stocks = [
            {
                symbol: 'BTC',
                name: 'Bitcoin',
                price: data.bitcoin?.usd || 43000,
                change: data.bitcoin?.usd_24h_change || 0,
                volume: data.bitcoin?.usd_24h_vol || 1000000000
            },
            {
                symbol: 'ETH',
                name: 'Ethereum',
                price: data.ethereum?.usd || 2600,
                change: data.ethereum?.usd_24h_change || 0,
                volume: data.ethereum?.usd_24h_vol || 500000000
            },
            {
                symbol: 'XRP',
                name: 'XRP',
                price: data.ripple?.usd || 0.60,
                change: data.ripple?.usd_24h_change || 0,
                volume: data.ripple?.usd_24h_vol || 200000000
            },
            {
                symbol: 'ADA',
                name: 'Cardano',
                price: data.cardano?.usd || 0.45,
                change: data.cardano?.usd_24h_change || 0,
                volume: data.cardano?.usd_24h_vol || 150000000
            },
            {
                symbol: 'DOT',
                name: 'Polkadot',
                price: data.polkadot?.usd || 7.50,
                change: data.polkadot?.usd_24h_change || 0,
                volume: data.polkadot?.usd_24h_vol || 100000000
            },
            {
                symbol: 'SOL',
                name: 'Solana',
                price: data.solana?.usd || 95.00,
                change: data.solana?.usd_24h_change || 0,
                volume: data.solana?.usd_24h_vol || 300000000
            }
        ];

        priceCache.data = stocks;
        priceCache.timestamp = Date.now();

        console.log('✅ Prices updated successfully');
        return stocks;

    } catch (error) {
        console.error('Error fetching real prices:', error.message);
        return getFallbackPrices();
    }
}

// Fallback prices
function getFallbackPrices() {
    console.log('Using fallback prices...');

    const baseData = {
        'BTC': { price: 43250.75, name: 'Bitcoin' },
        'ETH': { price: 2680.50, name: 'Ethereum' },
        'XRP': { price: 0.6234, name: 'XRP' },
        'ADA': { price: 0.4567, name: 'Cardano' },
        'DOT': { price: 7.89, name: 'Polkadot' },
        'SOL': { price: 98.76, name: 'Solana' }
    };

    return Object.keys(baseData).map(symbol => {
        const base = baseData[symbol];
        const fluctuation = (Math.random() - 0.5) * 0.05;
        const currentPrice = base.price * (1 + fluctuation);
        const change = fluctuation * 100;

        return {
            symbol,
            name: base.name,
            price: currentPrice,
            change: change,
            volume: 1000000000 * Math.random(),
            timestamp: Date.now(),
            source: 'fallback'
        };
    });
}

// AI Recommendation System with Enhanced Analysis
const aiRecommendationSystem = {
    // Calculate RSI
    calculateRSI(prices, period = 14) {
        if (!prices || prices.length < period + 1) return 50;

        let gains = 0, losses = 0;
        for (let i = 1; i <= period; i++) {
            const change = prices[i] - prices[i - 1];
            if (change > 0) gains += change;
            else losses -= change;
        }

        const avgGain = gains / period;
        const avgLoss = losses / period;

        if (avgLoss === 0) return 100;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    },

    // Calculate MACD
    calculateMACD(prices) {
        if (!prices || prices.length < 26) return { macd: 0, signal: 0, histogram: 0 };

        const ema12 = this.calculateEMA(prices.slice(-12), 12);
        const ema26 = this.calculateEMA(prices.slice(-26), 26);
        const macdLine = ema12 - ema26;
        const signalLine = macdLine * 0.2; // Simplified signal line

        return {
            macd: macdLine,
            signal: signalLine,
            histogram: macdLine - signalLine
        };
    },

    // Calculate EMA
    calculateEMA(prices, period) {
        if (!prices || prices.length === 0) return 0;

        const multiplier = 2 / (period + 1);
        let ema = prices[0];

        for (let i = 1; i < prices.length; i++) {
            ema = (prices[i] - ema) * multiplier + ema;
        }
        return ema;
    },

    // Calculate Bollinger Bands
    calculateBollingerBands(prices, period = 20) {
        if (!prices || prices.length < period) {
            const currentPrice = prices ? prices[prices.length - 1] : 100;
            return {
                upper: currentPrice * 1.02,
                middle: currentPrice,
                lower: currentPrice * 0.98
            };
        }

        const recentPrices = prices.slice(-period);
        const sma = recentPrices.reduce((a, b) => a + b, 0) / period;
        const variance = recentPrices.reduce((sum, price) =>
            sum + Math.pow(price - sma, 2), 0) / period;
        const stdDev = Math.sqrt(variance);

        return {
            upper: sma + (stdDev * 2),
            middle: sma,
            lower: sma - (stdDev * 2)
        };
    },

    // Generate historical prices for analysis
    generateHistoricalPrices(currentPrice, changePercent) {
        const prices = [];
        let price = currentPrice;

        // Generate 30 days of price history
        for (let i = 0; i < 30; i++) {
            // Use the actual 24h change to influence historical data
            const dailyChange = (Math.random() - 0.5) * 0.05 - (changePercent / 100 / 30);
            price = price / (1 + dailyChange);
            prices.unshift(price);
        }
        prices.push(currentPrice);

        return prices;
    },

    // Analyze individual stock
    async analyzeStock(stockData) {
        const { symbol, name, price, change, volume } = stockData;

        // Generate historical prices based on current price and 24h change
        const prices = this.generateHistoricalPrices(price, change);

        // Calculate technical indicators
        const rsi = this.calculateRSI(prices);
        const macd = this.calculateMACD(prices);
        const bollingerBands = this.calculateBollingerBands(prices);

        // Calculate sentiment score
        let sentimentScore = 50; // Start neutral

        // Price momentum (30% weight)
        if (change > 5) sentimentScore += 15;
        else if (change > 2) sentimentScore += 10;
        else if (change < -5) sentimentScore -= 15;
        else if (change < -2) sentimentScore -= 10;
        else sentimentScore += change * 2;

        // RSI (25% weight)
        if (rsi < 30) {
            sentimentScore += 12.5; // Oversold = potential buy
        } else if (rsi > 70) {
            sentimentScore -= 12.5; // Overbought = potential sell
        } else {
            sentimentScore += (50 - Math.abs(rsi - 50)) * 0.25;
        }

        // MACD (20% weight)
        if (macd.histogram > 0) sentimentScore += 10;
        else sentimentScore -= 10;

        // Bollinger Bands (15% weight)
        const bbPosition = (price - bollingerBands.lower) /
            (bollingerBands.upper - bollingerBands.lower);
        if (bbPosition < 0.2) sentimentScore += 7.5; // Near lower band = buy signal
        else if (bbPosition > 0.8) sentimentScore -= 7.5; // Near upper band = sell signal

        // Volume analysis (10% weight)
        if (volume > 1000000000) sentimentScore += 5; // High volume = good liquidity

        // Ensure score is within bounds
        sentimentScore = Math.max(0, Math.min(100, sentimentScore));

        // Determine recommendation
        let recommendation, confidence, action;

        if (sentimentScore >= 70) {
            recommendation = 'STRONG BUY';
            confidence = Math.min(95, sentimentScore);
            action = 'buy';
        } else if (sentimentScore >= 55) {
            recommendation = 'BUY';
            confidence = 70 + (sentimentScore - 55);
            action = 'buy';
        } else if (sentimentScore >= 45) {
            recommendation = 'HOLD';
            confidence = 60 + Math.abs(sentimentScore - 50) * 2;
            action = 'hold';
        } else if (sentimentScore >= 30) {
            recommendation = 'SELL';
            confidence = 70 + (45 - sentimentScore);
            action = 'sell';
        } else {
            recommendation = 'STRONG SELL';
            confidence = Math.min(95, 100 - sentimentScore);
            action = 'sell';
        }

        // Generate reasoning
        const reasons = [];

        if (change > 5) reasons.push(`Strong upward momentum with ${change.toFixed(2)}% gain`);
        else if (change < -5) reasons.push(`Significant decline of ${Math.abs(change).toFixed(2)}%`);

        if (rsi < 30) reasons.push('RSI indicates oversold conditions - potential rebound');
        else if (rsi > 70) reasons.push('RSI shows overbought conditions - correction possible');
        else if (rsi > 40 && rsi < 60) reasons.push('RSI in neutral zone');

        if (macd.histogram > 0) reasons.push('MACD signals bullish momentum');
        else reasons.push('MACD suggests bearish pressure');

        if (bbPosition < 0.3) reasons.push('Price near lower Bollinger Band - potential support');
        else if (bbPosition > 0.7) reasons.push('Price near upper Bollinger Band - potential resistance');

        if (volume > 5000000000) reasons.push('Exceptionally high trading volume');
        else if (volume > 1000000000) reasons.push('Strong trading volume indicates market interest');

        return {
            symbol,
            name,
            currentPrice: price,
            recommendation,
            action,
            confidence: Math.round(confidence),
            sentimentScore: Math.round(sentimentScore),
            technicals: {
                rsi: Math.round(rsi * 100) / 100,
                macd: {
                    value: Math.round(macd.macd * 1000) / 1000,
                    signal: Math.round(macd.signal * 1000) / 1000,
                    histogram: Math.round(macd.histogram * 1000) / 1000
                },
                bollingerBands: {
                    upper: Math.round(bollingerBands.upper * 100) / 100,
                    middle: Math.round(bollingerBands.middle * 100) / 100,
                    lower: Math.round(bollingerBands.lower * 100) / 100,
                    position: price > bollingerBands.upper ? 'Above Upper' :
                        price < bollingerBands.lower ? 'Below Lower' : 'Within Bands'
                },
                volume: {
                    current: volume,
                    trend: volume > 2000000000 ? 'high' : 'normal'
                }
            },
            analysis: {
                priceChange: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
                trend: change > 2 ? 'Bullish' : change < -2 ? 'Bearish' : 'Neutral',
                volatility: Math.abs(change) > 10 ? 'High' : Math.abs(change) > 5 ? 'Medium' : 'Low'
            },
            reasons: reasons.slice(0, 3), // Top 3 reasons
            timestamp: new Date().toISOString()
        };
    }
};

// API Routes

// Health check
app.get('/api/health', async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
        const userCount = await User.countDocuments();

        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                server: 'running',
                database: dbStatus,
                users: userCount,
                cache: priceCache.data ? 'active' : 'empty',
                ai_recommendations: 'active'
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

// User registration
app.post('/api/user/register', async (req, res) => {
    try {
        const { walletAddress } = req.body;

        if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
            return res.status(400).json({ error: 'Invalid wallet address format' });
        }

        // Check if user already exists
        let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

        if (user) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create new user
        user = new User({
            walletAddress: walletAddress.toLowerCase(),
            balance: 1000 + Math.random() * 500 // Starting balance
        });

        await user.save();
        console.log('✅ New user registered:', walletAddress);

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                walletAddress: user.walletAddress,
                balance: user.balance,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('❌ User registration error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Get user data
app.get('/api/user/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;

        if (!/^0x[a-fA-F0-9]{40}$/i.test(walletAddress)) {
            return res.status(400).json({ error: 'Invalid wallet address format' });
        }

        const user = await User.findOne({
            walletAddress: walletAddress.toLowerCase(),
            isActive: true
        }).select('-__v');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        res.json({
            user: {
                walletAddress: user.walletAddress,
                balance: user.balance,
                portfolio: user.portfolio,
                totalTrades: user.totalTrades,
                totalVolume: user.totalVolume,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('❌ User fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
});

// Get user portfolio
app.get('/api/user/:walletAddress/portfolio', async (req, res) => {
    try {
        const { walletAddress } = req.params;

        const user = await User.findOne({
            walletAddress: walletAddress.toLowerCase(),
            isActive: true
        }).select('portfolio balance');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Calculate current portfolio value
        let portfolioValue = 0;
        const stocks = await fetchRealPrices();

        for (const holding of user.portfolio) {
            const stock = stocks.find(s => s.symbol === holding.symbol);
            if (stock) {
                portfolioValue += holding.quantity * stock.price;
            } else {
                portfolioValue += holding.quantity * holding.averagePrice;
            }
        }

        res.json({
            portfolio: user.portfolio,
            balance: user.balance,
            totalValue: portfolioValue,
            cashValue: user.balance,
            totalPortfolioValue: portfolioValue + user.balance,
            lastUpdated: new Date()
        });

    } catch (error) {
        console.error('❌ Portfolio fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch portfolio' });
    }
});

// Get trading history
app.get('/api/user/:walletAddress/history', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const { limit = 50, page = 1 } = req.query;

        const user = await User.findOne({
            walletAddress: walletAddress.toLowerCase(),
            isActive: true
        }).select('tradingHistory');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const skip = (page - 1) * limit;
        const history = user.tradingHistory
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(skip, skip + parseInt(limit));

        res.json({
            history,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: user.tradingHistory.length,
                pages: Math.ceil(user.tradingHistory.length / limit)
            }
        });

    } catch (error) {
        console.error('❌ History fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch trading history' });
    }
});

// Get stock prices
app.get('/api/stocks', async (req, res) => {
    try {
        const stocks = await fetchRealPrices();
        res.json({
            stocks,
            source: priceCache.data ? 'coingecko_api' : 'fallback',
            timestamp: new Date().toISOString(),
            cached: Date.now() - priceCache.timestamp < priceCache.TTL
        });
    } catch (error) {
        console.error('❌ Error fetching stocks:', error);
        res.status(500).json({ error: 'Failed to fetch stock data' });
    }
});

// Get specific stock price
app.get('/api/stock/:symbol/price', async (req, res) => {
    try {
        const { symbol } = req.params;
        const stocks = await fetchRealPrices();
        const stock = stocks.find(s => s.symbol.toLowerCase() === symbol.toLowerCase());

        if (!stock) {
            return res.status(404).json({ error: 'Stock not found' });
        }

        res.json({
            symbol: stock.symbol,
            name: stock.name,
            price: stock.price,
            change: stock.change,
            timestamp: Date.now(),
            source: priceCache.data ? 'coingecko_api' : 'fallback'
        });
    } catch (error) {
        console.error('❌ Error fetching price:', error);
        res.status(500).json({ error: 'Failed to fetch price' });
    }
});

// AI Recommendation for specific stock
app.get('/api/ai/recommendation/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const stocks = await fetchRealPrices();
        const stock = stocks.find(s => s.symbol.toLowerCase() === symbol.toLowerCase());

        if (!stock) {
            return res.status(404).json({ error: 'Stock not found' });
        }

        const recommendation = await aiRecommendationSystem.analyzeStock(stock);
        res.json(recommendation);

    } catch (error) {
        console.error('AI recommendation error:', error);
        res.status(500).json({ error: 'Failed to generate recommendation' });
    }
});

// Get all AI recommendations
app.get('/api/ai/recommendations', async (req, res) => {
    try {
        const stocks = await fetchRealPrices();
        const recommendations = await Promise.all(
            stocks.map(stock => aiRecommendationSystem.analyzeStock(stock))
        );

        // Sort by confidence and recommendation strength
        const sorted = recommendations.sort((a, b) => {
            if (a.action === 'buy' && b.action !== 'buy') return -1;
            if (b.action === 'buy' && a.action !== 'buy') return 1;
            return b.confidence - a.confidence;
        });

        res.json({
            recommendations: sorted,
            summary: {
                strongBuy: sorted.filter(r => r.recommendation === 'STRONG BUY').length,
                buy: sorted.filter(r => r.recommendation === 'BUY').length,
                hold: sorted.filter(r => r.recommendation === 'HOLD').length,
                sell: sorted.filter(r => r.recommendation === 'SELL').length,
                strongSell: sorted.filter(r => r.recommendation === 'STRONG SELL').length,
                total: sorted.length
            },
            dataSource: priceCache.data ? 'CoinGecko API (Live)' : 'Fallback Data',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('AI recommendations error:', error);
        res.status(500).json({ error: 'Failed to generate recommendations' });
    }
});

// Market sentiment analysis
app.get('/api/ai/market-sentiment', async (req, res) => {
    try {
        const stocks = await fetchRealPrices();
        const recommendations = await Promise.all(
            stocks.map(stock => aiRecommendationSystem.analyzeStock(stock))
        );

        const avgSentiment = recommendations.reduce((sum, r) => sum + r.sentimentScore, 0) / recommendations.length;
        const bullishCount = recommendations.filter(r => r.action === 'buy').length;
        const bearishCount = recommendations.filter(r => r.action === 'sell').length;
        const neutralCount = recommendations.filter(r => r.action === 'hold').length;

        res.json({
            overallSentiment: avgSentiment > 60 ? 'Bullish' : avgSentiment < 40 ? 'Bearish' : 'Neutral',
            sentimentScore: Math.round(avgSentiment),
            marketMood: avgSentiment > 70 ? 'Very Optimistic' :
                avgSentiment > 55 ? 'Optimistic' :
                    avgSentiment > 45 ? 'Neutral' :
                        avgSentiment > 30 ? 'Pessimistic' : 'Very Pessimistic',
            signals: {
                bullish: bullishCount,
                bearish: bearishCount,
                neutral: neutralCount
            },
            topPicks: recommendations
                .filter(r => r.action === 'buy')
                .sort((a, b) => b.confidence - a.confidence)
                .slice(0, 3)
                .map(r => ({
                    symbol: r.symbol,
                    name: r.name,
                    price: r.currentPrice,
                    confidence: r.confidence,
                    reason: r.reasons[0]
                })),
            dataSource: priceCache.data ? 'Live Market Data' : 'Fallback Data',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Market sentiment error:', error);
        res.status(500).json({ error: 'Failed to analyze market sentiment' });
    }
});

// Verify wallet balance
app.post('/api/verify-balance', async (req, res) => {
    try {
        const { walletAddress } = req.body;

        if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/i.test(walletAddress)) {
            return res.status(400).json({ error: 'Invalid wallet address' });
        }

        // Find or create user
        let user = await User.findOne({
            walletAddress: walletAddress.toLowerCase()
        });

        if (!user) {
            // Create new user
            user = new User({
                walletAddress: walletAddress.toLowerCase(),
                balance: 1000 + Math.random() * 500
            });
            await user.save();
            console.log('✅ New user created during balance verification:', walletAddress);
        } else {
            // Update last login
            user.lastLogin = new Date();
            await user.save();
        }

        res.json({
            address: user.walletAddress,
            balance: user.balance,
            currency: 'FLR',
            network: 'coston2',
            isNewUser: user.createdAt > new Date(Date.now() - 60000) // Created in last minute
        });

    } catch (error) {
        console.error('❌ Error verifying balance:', error);
        res.status(500).json({ error: 'Failed to verify balance' });
    }
});

// Execute trade - MAIN TRADING FUNCTION
app.post('/api/execute-trade', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { walletAddress, symbol, quantity, pricePerShare } = req.body;

        // Validation
        if (!walletAddress || !symbol || !quantity || !pricePerShare) {
            await session.abortTransaction();
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!/^0x[a-fA-F0-9]{40}$/i.test(walletAddress)) {
            await session.abortTransaction();
            return res.status(400).json({ error: 'Invalid wallet address format' });
        }

        if (quantity <= 0 || pricePerShare <= 0) {
            await session.abortTransaction();
            return res.status(400).json({ error: 'Quantity and price must be positive' });
        }

        // Find user
        const user = await User.findOne({
            walletAddress: walletAddress.toLowerCase(),
            isActive: true
        }).session(session);

        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'User not found' });
        }

        const totalCost = quantity * pricePerShare;

        // Check balance
        if (user.balance < totalCost) {
            await session.abortTransaction();
            return res.status(400).json({
                error: 'Insufficient balance',
                required: totalCost,
                available: user.balance
            });
        }

        // Verify current price (within 5% tolerance)
        const stocks = await fetchRealPrices();
        const currentStock = stocks.find(s => s.symbol.toLowerCase() === symbol.toLowerCase());

        if (currentStock) {
            const priceDifference = Math.abs(currentStock.price - pricePerShare) / currentStock.price;
            if (priceDifference > 0.05) { // 5% tolerance
                await session.abortTransaction();
                return res.status(400).json({
                    error: 'Price has changed significantly',
                    currentPrice: currentStock.price,
                    requestedPrice: pricePerShare
                });
            }
        }

        // Generate transaction hash
        const transactionHash = '0x' + Array.from({ length: 64 }, () =>
            Math.floor(Math.random() * 16).toString(16)).join('');

        // Update user balance
        await user.updateBalance(-totalCost);

        // Update portfolio
        await user.updatePortfolio(symbol.toUpperCase(), quantity, pricePerShare, 'buy');

        // Add to trading history
        await user.addTrade({
            type: 'buy',
            symbol: symbol.toUpperCase(),
            quantity: quantity,
            price: pricePerShare,
            totalAmount: totalCost,
            timestamp: new Date(),
            transactionHash: transactionHash,
            status: 'completed'
        });

        await session.commitTransaction();

        console.log(`✅ Trade executed: ${quantity} ${symbol} for ${totalCost} by ${walletAddress}`);

        res.json({
            success: true,
            transactionId: transactionHash,
            message: 'Trade executed successfully',
            details: {
                symbol: symbol.toUpperCase(),
                quantity: quantity,
                pricePerShare: pricePerShare,
                totalCost: totalCost,
                newBalance: user.balance,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('❌ Trade execution error:', error);
        res.status(500).json({
            error: 'Trade execution failed',
            message: error.message
        });
    } finally {
        session.endSession();
    }
});

// FTSO info endpoint
app.get('/api/ftso/info', (req, res) => {
    res.json({
        registryAddress: '0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019',
        supportedSymbols: ['BTC', 'ETH', 'XRP', 'ADA', 'DOT', 'SOL'],
        network: 'Coston2 Testnet',
        totalFeeds: 6,
        status: 'active',
        lastUpdate: new Date().toISOString()
    });
});

// Get platform statistics
app.get('/api/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ isActive: true });
        const totalTrades = await User.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: null, total: { $sum: '$totalTrades' } } }
        ]);

        const totalVolume = await User.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: null, total: { $sum: '$totalVolume' } } }
        ]);

        res.json({
            totalUsers,
            totalTrades: totalTrades[0]?.total || 0,
            totalVolume: totalVolume[0]?.total || 0,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Stats error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('❌ Unhandled error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// Start server
const PORT = process.env.PORT || 3001;

// Connect to database and start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`✅ Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
        console.log(`📊 API Endpoints:`);
        console.log(`   - GET  /api/health`);
        console.log(`   - POST /api/user/register`);
        console.log(`   - GET  /api/user/:address`);
        console.log(`   - POST /api/execute-trade`);
        console.log(`   - GET  /api/stocks`);
        console.log(`   - GET  /api/ai/recommendations`);
        console.log(`   - GET  /api/ai/market-sentiment`);
        console.log(`💾 Database integration: ACTIVE`);
        console.log(`🤖 AI Trading Recommendations: ACTIVE`);
        console.log(`📡 Data Source: CoinGecko API (Free Tier)`);
        console.log(`🔄 Auto-refresh: 30 seconds`);
    });
}).catch(error => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    try {
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error('❌ Unhandled Promise Rejection:', err.message);
    console.error('Promise:', promise);
});

module.exports = app;