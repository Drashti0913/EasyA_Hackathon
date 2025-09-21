async function main() {
    console.log("Deploying StockTradingVerifier contract...");
    
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    
    const balance = await deployer.getBalance();
    console.log("Account balance:", ethers.utils.formatEther(balance), "FLR");
    
    const StockTradingVerifier = await ethers.getContractFactory("StockTradingVerifier");
    const contract = await StockTradingVerifier.deploy();
    
    await contract.deployed();
    
    console.log("✅ Contract deployed to:", contract.address);
    console.log("🔧 Add this address to your .env file as FLARE_CONTRACT_ADDRESS");
    
    return contract.address;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });