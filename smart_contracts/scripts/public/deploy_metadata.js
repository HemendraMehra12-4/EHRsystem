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
}

// Helper function to deploy contract
async function createContract(provider, wallet, contractAbi, contractBytecode, constructorArgs = []) {
    const factory = new ethers.ContractFactory(contractAbi, contractBytecode, wallet);
    const contract = await factory.deploy(...constructorArgs);
    const deployed = await contract.waitForDeployment();
    return deployed;
}

// Function to update contractAddresses.js
function updateContractAddresses(key, address) {
    const filePath = path.resolve(__dirname, "..", "address.js");
    // Read existing file or create new if not found
    let existingData = {};
    if (fs.existsSync(filePath)) {
        existingData = require(filePath);
    }
    // Update the object with the new address
    existingData[key] = address;
        // Manually format the JS object to avoid double quotes around keys
        const formattedData = Object.entries(existingData)
        .map(([k, v]) => `    ${k}: "${v}"`)
        .join(",\n");
    // Create module.exports content
    const fileContent = `module.exports = {\n${formattedData}\n};\n`;
    // Write the formatted content to the file
    fs.writeFileSync(filePath, fileContent);
    console.log(`Updated ${key} address in address.js`);

}

async function main() {
    const provider = new ethers.JsonRpcProvider(host);
    const wallet = new ethers.Wallet(accountPrivateKey, provider);

    try {
        const registryAddress = address.registry; // Insert the deployed Registry contract address
        const permissionAddress = address.permission;  // Insert the deployed Permission contract address
        const notificationManagerAddress = address.notification;  // Insert the deployed NotificationManager contract address
       
        // Deploy the Permission contract with Registry and NotificationManager addresses
        const { abi: metadataAbi, bytecode: metadatBytecode } = getContractData('Metadata');
        const metadataContract = await createContract(provider, wallet, metadataAbi, metadatBytecode, [registryAddress,permissionAddress, notificationManagerAddress]);
        const metadataAddress = await metadataContract.getAddress();
        console.log("Metadata contract deployed at:", metadataAddress);
        updateContractAddresses("metadata",metadataAddress);
    


    

    } catch (error) {
        console.error("An error occurred:", error);
    }
}

if (require.main === module) {
    main();
}

module.exports = main;
