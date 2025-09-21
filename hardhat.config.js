require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

module.exports = {
    solidity: {
        version: "0.8.19",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },
    networks: {
        coston2: {
            url: "https://coston2-api.flare.network/ext/C/rpc",
            accounts: process.env.FLARE_PRIVATE_KEY ? [process.env.FLARE_PRIVATE_KEY] : [],
            chainId: 114,
            gasPrice: 25000000000
        }
    },
    etherscan: {
        apiKey: {
            coston2: "coston2"
        },
        customChains: [
            {
                network: "coston2",
                chainId: 114,
                urls: {
                    apiURL: "https://coston2-explorer.flare.network/api",
                    browserURL: "https://coston2-explorer.flare.network"
                }
            }
        ]
    }
};