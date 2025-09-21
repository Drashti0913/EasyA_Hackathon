// portfolio-server.js - Separate AI Portfolio Analyzer Server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('portfolio-public'));

// Advanced Portfolio Analyzer
const portfolioAnalyzer = {
    
    // Get current market data for all asset classes
    getCurrentMarketData() {
        return {
            crypto: [
                { symbol: 'BTC', name: 'Bitcoin', price: 43250.75, volatility: 0.45, expectedReturn: 0.15, risk: 'high', marketCap: '850B' },
                { symbol: 'ETH', name: 'Ethereum', price: 2680.50, volatility: 0.55, expectedReturn: 0.18, risk: 'high', marketCap: '320B' },
                { symbol: 'XRP', name: 'XRP', price: 0.6234, volatility: 0.65, expectedReturn: 0.12, risk: 'high', marketCap: '35B' },
                { symbol: 'ADA', name: 'Cardano', price: 0.4567, volatility: 0.70, expectedReturn: 0.10, risk: 'high', marketCap: '16B' },
                { symbol: 'SOL', name: 'Solana', price: 98.76, volatility: 0.75, expectedReturn: 0.20, risk: 'high', marketCap: '45B' }
            ],
            stocks: [
                { symbol: 'AAPL', name: 'Apple Inc.', price: 175.25, volatility: 0.25, expectedReturn: 0.08, risk: 'medium', sector: 'Technology' },
                { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.50, volatility: 0.30, expectedReturn: 0.09, risk: 'medium', sector: 'Technology' },
                { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.90, volatility: 0.22, expectedReturn: 0.07, risk: 'low', sector: 'Technology' },
                { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.15, volatility: 0.50, expectedReturn: 0.12, risk: 'high', sector: 'Automotive' },
                { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 485.22, volatility: 0.40, expectedReturn: 0.14, risk: 'high', sector: 'Technology' }
            ],
            commodities: [
                { symbol: 'GOLD', name: 'Gold', price: 2050.25, volatility: 0.15, expectedReturn: 0.05, risk: 'low', type: 'Precious Metal' },
                { symbol: 'SILVER', name: 'Silver', price: 24.75, volatility: 0.25, expectedReturn: 0.06, risk: 'medium', type: 'Precious Metal' },
                { symbol: 'OIL', name: 'Crude Oil', price: 82.45, volatility: 0.35, expectedReturn: 0.07, risk: 'medium', type: 'Energy' },
                { symbol: 'COPPER', name: 'Copper', price: 3.85, volatility: 0.28, expectedReturn: 0.06, risk: 'medium', type: 'Industrial Metal' }
            ],
            bonds: [
                { symbol: 'US10Y', name: 'US Treasury 10Y', price: 95.75, volatility: 0.10, expectedReturn: 0.04, risk: 'low', rating: 'AAA' },
                { symbol: 'CORP', name: 'Corporate Bonds', price: 98.25, volatility: 0.12, expectedReturn: 0.05, risk: 'low', rating: 'AA' },
                { symbol: 'TIPS', name: 'Inflation Protected', price: 96.50, volatility: 0.08, expectedReturn: 0.045, risk: 'low', rating: 'AAA' }
            ],
            reits: [
                { symbol: 'VNQ', name: 'Real Estate ETF', price: 85.30, volatility: 0.20, expectedReturn: 0.06, risk: 'medium', type: 'Real Estate' },
                { symbol: 'REIT', name: 'Commercial REIT', price: 45.80, volatility: 0.25, expectedReturn: 0.07, risk: 'medium', type: 'Commercial' }
            ]
        };
    },

    // Analyze and rank all assets
    analyzeAndRankAssets(marketData, profile) {
        const allAssets = [
            ...marketData.crypto.map(asset => ({...asset, category: 'Cryptocurrency'})),
            ...marketData.stocks.map(asset => ({...asset, category: 'Stock'})),
            ...marketData.commodities.map(asset => ({...asset, category: 'Commodity'})),
            ...marketData.bonds.map(asset => ({...asset, category: 'Bond'})),
            ...marketData.reits.map(asset => ({...asset, category: 'Real Estate'}))
        ];

        // Score each asset
        const scoredAssets = allAssets.map(asset => {
            let score = asset.expectedReturn * 100; // Base score from expected return
            
            // Adjust for risk tolerance
            if (profile.riskTolerance === 'low') {
                score -= asset.volatility * 50; // Heavily penalize volatility
                if (asset.risk === 'low') score += 10; // Bonus for low risk assets
            } else if (profile.riskTolerance === 'high') {
                score += asset.volatility * 20; // Reward volatility for growth
                if (asset.expectedReturn > 0.10) score += 15; // Bonus for high return potential
            }
            
            // Time horizon adjustments
            if (profile.timeline === 'long_term') {
                if (asset.category === 'Cryptocurrency' || asset.category === 'Stock') score += 10;
            } else if (profile.timeline === 'short_term') {
                if (asset.category === 'Bond' || asset.risk === 'low') score += 8;
            }
            
            // Age-based adjustments
            if (profile.age <= 30 && asset.category === 'Cryptocurrency') score += 5;
            if (profile.age >= 50 && asset.category === 'Bond') score += 8;
            
            return { ...asset, score: Math.round(score * 100) / 100 };
        });

        return scoredAssets.sort((a, b) => b.score - a.score);
    },

    // Generate optimal allocation
    generateOptimalAllocation(rankedAssets, investmentAmount, profile) {
        const allocation = {};
        let remainingPercentage = 100;
        let assetCount = 0;
        
        // Determine number of assets based on investment amount
        const maxAssets = investmentAmount >= 50000 ? 8 : 
                         investmentAmount >= 20000 ? 6 : 
                         investmentAmount >= 10000 ? 5 : 4;

        // Allocation strategy based on risk tolerance
        const allocationWeights = this.getAllocationWeights(profile.riskTolerance, maxAssets);
        
        for (let i = 0; i < Math.min(maxAssets, rankedAssets.length); i++) {
            const asset = rankedAssets[i];
            const percentage = allocationWeights[i];
            
            allocation[asset.symbol] = {
                symbol: asset.symbol,
                name: asset.name,
                category: asset.category,
                percentage: percentage,
                amount: (investmentAmount * percentage) / 100,
                expectedReturn: asset.expectedReturn,
                volatility: asset.volatility,
                risk: asset.risk,
                score: asset.score,
                reasoning: this.generateReasoning(asset, profile),
                projectedValue1Year: Math.round((investmentAmount * percentage / 100) * (1 + asset.expectedReturn)),
                projectedGain: Math.round((investmentAmount * percentage / 100) * asset.expectedReturn)
            };
            
            assetCount++;
            remainingPercentage -= percentage;
        }

        return allocation;
    },

    // Get allocation weights based on risk profile
    getAllocationWeights(riskTolerance, numAssets) {
        const weights = {
            low: {
                4: [35, 30, 25, 10],
                5: [30, 25, 20, 15, 10],
                6: [25, 22, 18, 15, 12, 8],
                8: [20, 18, 16, 14, 12, 10, 6, 4]
            },
            medium: {
                4: [40, 30, 20, 10],
                5: [35, 25, 20, 12, 8],
                6: [30, 22, 18, 15, 10, 5],
                8: [25, 20, 15, 12, 10, 8, 6, 4]
            },
            high: {
                4: [45, 25, 20, 10],
                5: [40, 25, 15, 12, 8],
                6: [35, 25, 15, 12, 8, 5],
                8: [30, 22, 15, 12, 8, 6, 4, 3]
            }
        };
        
        return weights[riskTolerance][numAssets] || [25, 25, 25, 25];
    },

    // Generate detailed reasoning for each investment
    generateReasoning(asset, profile) {
        const baseReasons = {
            'BTC': 'Digital store of value with institutional adoption and limited supply',
            'ETH': 'Smart contract leader powering DeFi and NFT ecosystems',
            'XRP': 'Cross-border payment solution with banking partnerships',
            'ADA': 'Sustainable blockchain with strong academic foundation',
            'SOL': 'High-performance blockchain for DeFi and Web3 applications',
            'AAPL': 'Market leader with strong brand loyalty and consistent innovation',
            'GOOGL': 'Dominant search engine with growing cloud and AI businesses',
            'MSFT': 'Enterprise software giant with recurring subscription revenue',
            'TSLA': 'Electric vehicle pioneer expanding into energy and AI',
            'NVDA': 'AI chip leader benefiting from machine learning boom',
            'GOLD': 'Inflation hedge and crisis-safe asset with 5000-year history',
            'SILVER': 'Industrial demand growth with precious metal properties',
            'OIL': 'Energy transition creating supply constraints and price support',
            'US10Y': 'Risk-free government backing with stable income stream',
            'VNQ': 'Real estate exposure with professional management and liquidity'
        };
        
        let reasoning = baseReasons[asset.symbol] || 'Strong fundamentals with growth potential';
        
        // Add personalized context
        if (profile.timeline === 'long_term' && asset.expectedReturn > 0.10) {
            reasoning += '. Excellent for long-term wealth compounding over 10+ years.';
        } else if (profile.timeline === 'short_term' && asset.volatility < 0.20) {
            reasoning += '. Low volatility makes it suitable for short-term capital preservation.';
        } else if (asset.score > 20) {
            reasoning += '. High AI confidence score based on current market conditions.';
        }
        
        return reasoning;
    },

    // Calculate comprehensive portfolio metrics
    calculateAdvancedMetrics(allocation) {
        const assets = Object.values(allocation);
        
        const weightedReturn = assets.reduce((sum, asset) => 
            sum + (asset.percentage / 100) * asset.expectedReturn, 0);
        
        const portfolioVolatility = Math.sqrt(
            assets.reduce((sum, asset) => 
                sum + Math.pow((asset.percentage / 100) * asset.volatility, 2), 0)
        );
        
        const sharpeRatio = (weightedReturn - 0.03) / portfolioVolatility;
        
        // Calculate diversification score
        const categories = {};
        assets.forEach(asset => {
            categories[asset.category] = (categories[asset.category] || 0) + asset.percentage;
        });
        
        const diversificationScore = Object.keys(categories).length * 15 + 
            (50 - Math.max(...Object.values(categories)));
        
        // Calculate total projected gains
        const totalProjectedGain = assets.reduce((sum, asset) => sum + asset.projectedGain, 0);
        
        return {
            expectedReturn: Math.round(weightedReturn * 10000) / 100,
            volatility: Math.round(portfolioVolatility * 10000) / 100,
            sharpeRatio: Math.round(sharpeRatio * 100) / 100,
            diversificationScore: Math.min(100, Math.max(0, Math.round(diversificationScore))),
            riskLevel: portfolioVolatility < 0.15 ? 'Low' : portfolioVolatility < 0.30 ? 'Medium' : 'High',
            totalProjectedGain: totalProjectedGain,
            categoryBreakdown: categories
        };
    }
};

// Routes

// Serve portfolio analyzer page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'portfolio-public', 'portfolio.html'));
});

// Advanced portfolio analysis
app.post('/api/analyze', (req, res) => {
    try {
        console.log('Advanced portfolio analysis request:', req.body);
        const { profile, investmentAmount } = req.body;
        
        if (!profile || !investmentAmount || investmentAmount < 1000) {
            return res.status(400).json({ 
                error: 'Minimum $1,000 required for comprehensive analysis' 
            });
        }

        // Get market data
        const marketData = portfolioAnalyzer.getCurrentMarketData();
        
        // Analyze and rank assets
        const rankedAssets = portfolioAnalyzer.analyzeAndRankAssets(marketData, profile);
        
        // Generate optimal allocation
        const allocation = portfolioAnalyzer.generateOptimalAllocation(rankedAssets, investmentAmount, profile);
        
        // Calculate metrics
        const metrics = portfolioAnalyzer.calculateAdvancedMetrics(allocation);
        
        // Generate comprehensive report
        const report = {
            summary: {
                totalInvestment: investmentAmount,
                numberOfAssets: Object.keys(allocation).length,
                expectedAnnualReturn: `${metrics.expectedReturn}%`,
                projectedValue1Year: investmentAmount + metrics.totalProjectedGain,
                totalProjectedGain: metrics.totalProjectedGain,
                riskLevel: metrics.riskLevel,
                diversificationScore: `${metrics.diversificationScore}/100`,
                sharpeRatio: metrics.sharpeRatio
            },
            allocation,
            metrics,
            marketAnalysis: {
                totalAssetsAnalyzed: rankedAssets.length,
                topPerformer: rankedAssets[0],
                categoryBreakdown: metrics.categoryBreakdown,
                recommendationConfidence: 'High'
            },
            timestamp: new Date().toISOString()
        };
        
        console.log('Advanced analysis completed');
        res.json(report);
        
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: 'Analysis failed: ' + error.message });
    }
});

// Get asset comparison data
app.get('/api/assets/comparison', (req, res) => {
    try {
        const marketData = portfolioAnalyzer.getCurrentMarketData();
        const allAssets = Object.values(marketData).flat();
        
        const comparison = allAssets.map(asset => ({
            symbol: asset.symbol,
            name: asset.name,
            category: asset.category || 'Investment',
            price: asset.price,
            expectedReturn: `${(asset.expectedReturn * 100).toFixed(1)}%`,
            volatility: `${(asset.volatility * 100).toFixed(1)}%`,
            riskAdjustedReturn: Math.round((asset.expectedReturn / asset.volatility) * 100) / 100,
            recommendation: asset.expectedReturn > 0.12 ? 'Strong Buy' : 
                          asset.expectedReturn > 0.08 ? 'Buy' : 
                          asset.expectedReturn > 0.05 ? 'Hold' : 'Avoid'
        }));
        
        comparison.sort((a, b) => b.riskAdjustedReturn - a.riskAdjustedReturn);
        
        res.json({
            comparison,
            analysis: {
                bestRiskAdjusted: comparison[0],
                highestReturn: allAssets.reduce((max, asset) => 
                    asset.expectedReturn > max.expectedReturn ? asset : max),
                lowestRisk: allAssets.reduce((min, asset) => 
                    asset.volatility < min.volatility ? asset : min),
                recommended: comparison.filter(asset => 
                    asset.recommendation === 'Strong Buy' || asset.recommendation === 'Buy')
            }
        });
        
    } catch (error) {
        res.status(500).json({ error: 'Comparison failed' });
    }
});

// Market insights endpoint
app.get('/api/market/insights', (req, res) => {
    try {
        const marketData = portfolioAnalyzer.getCurrentMarketData();
        
        const insights = {
            marketOverview: {
                sentiment: ['Bullish', 'Neutral', 'Bearish'][Math.floor(Math.random() * 3)],
                volatilityLevel: 'Moderate',
                recommendedAction: 'Gradual Position Building'
            },
            categoryInsights: Object.keys(marketData).map(category => {
                const assets = marketData[category];
                const avgReturn = assets.reduce((sum, asset) => sum + asset.expectedReturn, 0) / assets.length;
                const avgVolatility = assets.reduce((sum, asset) => sum + asset.volatility, 0) / assets.length;
                
                return {
                    category: category.charAt(0).toUpperCase() + category.slice(1),
                    averageReturn: `${(avgReturn * 100).toFixed(1)}%`,
                    averageVolatility: `${(avgVolatility * 100).toFixed(1)}%`,
                    outlook: avgReturn > 0.08 ? 'Positive' : avgReturn > 0.05 ? 'Neutral' : 'Cautious',
                    topAsset: assets.reduce((max, asset) => 
                        asset.expectedReturn > max.expectedReturn ? asset : max)
                };
            }),
            investmentTips: [
                'Diversification across asset classes reduces portfolio risk',
                'Higher investment amounts enable better diversification',
                'Long-term investments can handle more volatility for growth',
                'Regular rebalancing maintains optimal allocation',
                'Consider dollar-cost averaging for volatile assets'
            ]
        };
        
        res.json(insights);
        
    } catch (error) {
        res.status(500).json({ error: 'Market insights failed' });
    }
});

// Start server
const PORT = process.env.PORTFOLIO_PORT || 3002;

app.listen(PORT, () => {
    console.log(`🤖 AI Portfolio Analyzer running on http://localhost:${PORT}`);
    console.log(`📊 Advanced multi-asset analysis available`);
    console.log(`💼 Analyzing: Crypto, Stocks, Commodities, Bonds, REITs`);
});

module.exports = app;