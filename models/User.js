// models/User.js - User data model
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    walletAddress: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        sparse: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    username: {
        type: String,
        sparse: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    profile: {
        riskTolerance: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium'
        },
        investmentExperience: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'beginner'
        },
        investmentGoals: {
            type: String,
            enum: ['growth', 'income', 'preservation', 'speculation'],
            default: 'growth'
        },
        timeline: {
            type: String,
            enum: ['short_term', 'medium_term', 'long_term'],
            default: 'medium_term'
        }
    },
    balance: {
        type: Number,
        default: 0
    },
    portfolio: [{
        symbol: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 0
        },
        averagePrice: {
            type: Number,
            required: true
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
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        totalAmount: {
            type: Number,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        transactionHash: String
    }],
    preferences: {
        emailNotifications: {
            type: Boolean,
            default: true
        },
        priceAlerts: {
            type: Boolean,
            default: false
        },
        riskLevelAlerts: {
            type: Boolean,
            default: true
        }
    },
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
    }
}, {
    timestamps: true
});

// Index for faster queries
userSchema.index({ walletAddress: 1 });
userSchema.index({ email: 1 });
userSchema.index({ 'portfolio.symbol': 1 });
userSchema.index({ 'tradingHistory.timestamp': -1 });

// Method to update user balance
userSchema.methods.updateBalance = function (amount) {
    this.balance += amount;
    return this.save();
};

// Method to add trade to history
userSchema.methods.addTrade = function (tradeData) {
    this.tradingHistory.push(tradeData);
    return this.save();
};

// Method to update portfolio
userSchema.methods.updatePortfolio = function (symbol, quantity, price, type) {
    const existingHolding = this.portfolio.find(h => h.symbol === symbol);

    if (existingHolding) {
        if (type === 'buy') {
            const totalCost = (existingHolding.quantity * existingHolding.averagePrice) + (quantity * price);
            const totalQuantity = existingHolding.quantity + quantity;
            existingHolding.averagePrice = totalCost / totalQuantity;
            existingHolding.quantity = totalQuantity;
        } else if (type === 'sell') {
            existingHolding.quantity -= quantity;
            if (existingHolding.quantity <= 0) {
                this.portfolio = this.portfolio.filter(h => h.symbol !== symbol);
            }
        }
    } else if (type === 'buy') {
        this.portfolio.push({
            symbol,
            quantity,
            averagePrice: price,
            purchaseDate: new Date()
        });
    }

    return this.save();
};

module.exports = mongoose.model('User', userSchema);