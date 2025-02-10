const path = require('path');
const fs = require('fs-extra');
const ethers = require('ethers');
const address = require("../address.js");
// RPCNODE details
const { tessera, besu } = require("../keys.js");
const host = besu.rpcnode.url;
const accountPrivateKey = besu.rpcnode.accountPrivateKey;

// Helper function to read contract ABI and bytecode
const getContractData = (contractName) => {
    const contractJsonPath = path.resolve(__dirname, '../../', 'contracts', `${contractName}.json`);
    const contractJson = JSON.parse(fs.readFileSync(contractJsonPath));
    return {
        abi: contractJson.abi,
        bytecode: contractJson.evm.bytecode.object
    };
};

// Helper function to deploy contract
async function createContract(provider, wallet, contractAbi, contractBytecode, constructorArgs = []) {
    const factory = new ethers.ContractFactory(contractAbi, contractBytecode, wallet);
    const contract = await factory.deploy(...constructorArgs);
    const deployed = await contract.waitForDeployment();
    return deployed;
}

// Function to update contractAddresses.js
function updateContractAddresses(key, contractAddress) {
    const filePath = path.resolve(__dirname, "..", "address.js");
    let existingData = {};
    if (fs.existsSync(filePath)) {
        existingData = require(filePath);
    }
    existingData[key] = contractAddress;
    
    const formattedData = Object.entries(existingData)
        .map(([k, v]) => `    ${k}: "${v}"`)
        .join(",\n");
    
    const fileContent = `module.exports = {\n${formattedData}\n};\n`;
    fs.writeFileSync(filePath, fileContent);
    console.log(`Updated ${key} address in address.js`);
}

async function main() {
    const provider = new ethers.JsonRpcProvider(host);
    const wallet = new ethers.Wallet(accountPrivateKey, provider);

    try {
        const registryAddress = address.registry; 
        const notificationManagerAddress = address.notification; 
        const metadataAddress = address.metadata;

        // Deploy the Permission contract with Registry, NotificationManager, and Metadata addresses
        const { abi: permissionAbi, bytecode: permissionBytecode } = getContractData('Permission');
        const permissionContract = await createContract(provider, wallet, permissionAbi, permissionBytecode, [registryAddress, notificationManagerAddress, metadataAddress]);
        const permissionAddress = await permissionContract.getAddress();
        console.log("Permission contract deployed at:", permissionAddress);
        updateContractAddresses("permission", permissionAddress);
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

if (require.main === module) {
    main();
}

module.exports = main;
