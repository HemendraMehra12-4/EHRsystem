const path = require("path");
const fs = require("fs-extra");
const ethers = require("ethers");

// RPC Node Details
const { tessera, besu } = require("../keys.js");
const host = besu.rpcnode.url;
const accountPrivateKey = besu.rpcnode.accountPrivateKey;

// Load NotificationManager contract ABI
const contractJsonPath = path.resolve(__dirname, "../../", "contracts", "NotificationManager.json");
const contractJson = JSON.parse(fs.readFileSync(contractJsonPath));
const contractAbi = contractJson.abi;

// Load stored contract addresses
const address = require("../address.js");

// Ensure contract address exists
if (!address.notification) {
    console.error("Error: No contract address found in address.js. Ensure the NotificationManager contract is deployed.");
    process.exit(1);
}

const contractAddress = address.notification;
console.log("Using existing NotificationManager contract at address:", contractAddress);

// Helper to get notifications for a user
async function getNotifications(provider, deployedContractAbi, deployedContractAddress, userKey) {
    const contract = new ethers.Contract(deployedContractAddress, deployedContractAbi, provider);
    
    const notifications = await contract.getNotifications(userKey);
    console.log("User Notifications:");
    notifications.forEach((notification, index) => {
        if (notification.length > 0) console.log(`[${index + 1}] ${notification}`);
    });
    return notifications;
}

async function main() {
    const provider = new ethers.JsonRpcProvider(host);
    const wallet = new ethers.Wallet(accountPrivateKey, provider);

    try {
        const userKey = ethers.encodeBytes32String("UserKey7");
        console.log("Fetching notifications...");
        await getNotifications(provider, contractAbi, contractAddress, userKey);
    } catch (error) {
        console.error("An error occurred!\nCheck if the user exists or if notifications are being added properly.", error);
    }
}

if (require.main === module) {
    main();
}

module.exports = main;
