const path = require("path");
const fs = require("fs-extra");
const ethers = require("ethers");

// RPC Node Details
const { tessera, besu } = require("../keys.js");
const host = besu.rpcnode.url;
const accountPrivateKey = besu.rpcnode.accountPrivateKey;

// Load Metadata contract ABI
const contractJsonPath = path.resolve(__dirname, "../../", "contracts", "Metadata.json");
const contractJson = JSON.parse(fs.readFileSync(contractJsonPath));
const contractAbi = contractJson.abi;

// Load stored contract addresses
const address = require("../address.js");

// Ensure contract address exists
if (!address.metadata) {
    console.error("Error: No contract address found in address.js. Ensure the Metadata contract is deployed.");
    process.exit(1);
}

const contractAddress = address.metadata;
console.log("Using existing Metadata contract at address:", contractAddress);

// Helper to add EHR data
async function addEHRdata(provider, wallet, deployedContractAbi, deployedContractAddress, userKey, key, dataType, hashIndex, encKey) {
    const contract = new ethers.Contract(deployedContractAddress, deployedContractAbi, provider);
    const contractWithSigner = contract.connect(wallet);
    
    const tx = await contractWithSigner.addEHRdata(userKey, key, dataType, hashIndex, encKey);
    await tx.wait();
    
    console.log("EHR data added successfully!");
    return tx;
}

// Helper to get patient data
async function getPatientData(provider, deployedContractAbi, deployedContractAddress, userKey) {
    const contract = new ethers.Contract(deployedContractAddress, deployedContractAbi, provider);
    
    const data = await contract.getPatientData(userKey);
    console.log("Retrieved patient data:", data);
    return data;
}

async function main() {
    const provider = new ethers.JsonRpcProvider(host);
    const wallet = new ethers.Wallet(accountPrivateKey, provider);

    try {
        const userKey = ethers.encodeBytes32String("UserKey8"); // Example user
        const ehrKey = ethers.encodeBytes32String("EHR123");
        const dataType = 0; // BloodTest (0), XRay (1), MRI (2), Prescription (3)
        const hashIndex = ethers.encodeBytes32String("HASH123");
        const encKey = ethers.encodeBytes32String("ENCKEY123");

        // console.log("Adding EHR data...");
        // await addEHRdata(provider, wallet, contractAbi, contractAddress, userKey, ehrKey, dataType, hashIndex, encKey);

        console.log("Fetching patient data...");
        await getPatientData(provider, contractAbi, contractAddress, userKey);
    } catch (error) {
        console.error("An error occurred!\nCheck if the user has permission or if data exists.", error);
    }
}

if (require.main === module) {
    main();
}

module.exports = main;
