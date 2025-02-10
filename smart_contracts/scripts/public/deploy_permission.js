const path = require('path');
const fs = require('fs-extra');
const ethers = require('ethers');

// RPCNODE details
const { tessera, besu } = require("../keys.js");
const address = require("../address.js"); 
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

// Register a user with a specified role
async function registerUser(provider, wallet, registryAbi, registryAddress, userKey, role) {
    const registryContract = new ethers.Contract(registryAddress, registryAbi, provider);
    const registryWithSigner = registryContract.connect(wallet);
    const tx = await registryWithSigner.registerUser(userKey, role);
    await tx.wait();
    console.log(`User ${userKey} registered with role: ${role}`);
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
        // Insert the existing Registry and NotificationManager contract addresses
        const registryAddress = address.registry;  // Replace with your actual Registry contract address
        const notificationManagerAddress = address.notification;  // Replace with your actual NotificationManager address

        // Deploy the Permission contract with Registry and NotificationManager addresses
        const { abi: permissionAbi, bytecode: permissionBytecode } = getContractData('Permission');
        const permissionContract = await createContract(provider, wallet, permissionAbi, permissionBytecode, [registryAddress, notificationManagerAddress]);
        const permissionAddress = await permissionContract.getAddress();
        console.log("Permission contract deployed at:", permissionAddress);
        updateContractAddresses("permission",permissionAddress);

        // Get Registry contract ABI to register users
        const { abi: registryAbi } = getContractData('Registry');
        
        // Register the requester and granter users with any role (e.g., "Patient")
        const requesterKey = ethers.encodeBytes32String("RequesterKey3");
        const granterKey = ethers.encodeBytes32String("GranterKey3");

        // Register users
        await registerUser(provider, wallet, registryAbi, registryAddress, requesterKey, "Patient");
        await registerUser(provider, wallet, registryAbi, registryAddress, granterKey, "CareProvider");

        // Interact with the deployed Permission contract
        const permissionContractWithSigner = permissionContract.connect(wallet);

        // Request permission
        await permissionContractWithSigner.requestPermission(requesterKey, granterKey);
        console.log(`Permission request sent from ${requesterKey} to ${granterKey}`);

        // Approve permission
        await permissionContractWithSigner.approvePermission(requesterKey, granterKey, true);
        console.log(`Permission granted from ${granterKey} to ${requesterKey}`);

        // Check permission
        const hasPermission = await permissionContract.checkPermission(requesterKey, granterKey);
        console.log(`Permission status for ${requesterKey} and ${granterKey}:`, hasPermission);

    } catch (error) {
        console.error("An error occurred:", error);
    }
}

if (require.main === module) {
    main();
}

module.exports = main;
