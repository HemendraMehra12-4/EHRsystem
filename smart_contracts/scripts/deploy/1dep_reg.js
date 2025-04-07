const path = require('path');
const fs = require('fs-extra');
const ethers = require('ethers');

// RPCNODE details
const { tessera, besu } = require("../keys.js");
const host = besu.rpcnode.url;
// console.log(host);
const accountPrivateKey = besu.rpcnode.accountPrivateKey;
// console.log(accountPrivateKey);

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
async function createContract(provider, wallet, contractAbi, contractBytecode) {
    const factory = new ethers.ContractFactory(contractAbi, contractBytecode, wallet);
    const contract = await factory.deploy();
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

// Main function to deploy the Registry contract and interact
async function main() {
    const provider = new ethers.JsonRpcProvider(host);
    const wallet = new ethers.Wallet(accountPrivateKey, provider);

    try {
        // Deploy the Registry contract
        const { abi: registryAbi, bytecode: registryBytecode } = getContractData('Registry');
        const registryContract = await createContract(provider, wallet, registryAbi, registryBytecode);
        const registryAddress = await registryContract.getAddress();
        console.log("Registry contract deployed at address:", registryAddress);
        updateContractAddresses("registry",registryAddress);


        // Interact with the deployed Registry contract
        const userKey = ethers.encodeBytes32String("UserKey1");
        const role = "Patient"; // Change this to test with different roles

        // Register a user
        const contract = new ethers.Contract(registryAddress, registryAbi, provider);
        const contractWithSigner = contract.connect(wallet);
        const tx = await contractWithSigner.registerUser(userKey, role);
        await tx.wait();
        console.log("User registered with role:", role);

        // Get the user's role
        const roleResult = await contract.getUserRole(userKey);
        console.log("User role:", roleResult);

    } catch (error) {
        console.error("An error occurred:", error);
    }
}

if (require.main === module) {
    main();
}

module.exports = main;
