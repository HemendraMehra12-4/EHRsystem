const ethers = require('ethers');
const path = require('path');
const fs = require('fs-extra');

// RPCNODE details
const { tessera, besu } = require("../keys.js");
const host = besu.rpcnode.url;
const accountPrivateKey = besu.rpcnode.accountPrivateKey;

// Load contract addresses
const addressesPath = path.resolve(__dirname,'../', 'addresses.json');
const addresses = JSON.parse(fs.readFileSync(addressesPath));

// Contract addresses
const registryAddress = addresses.registry;
const permissionAddress = addresses.permission;
const metadataAddress = addresses.metadata;

// Load ABIs
const registryAbi = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../', 'contracts', 'Registry.json'))).abi;
const permissionAbi = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../', 'contracts', 'Permission.json'))).abi;
const metadataAbi = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../', 'contracts', 'Metadata.json'))).abi;

async function main() {
    const provider = new ethers.JsonRpcProvider(host);
    const wallet = new ethers.Wallet(accountPrivateKey, provider);

    // Connect to contracts
    const registry = new ethers.Contract(registryAddress, registryAbi, wallet);
    const permission = new ethers.Contract(permissionAddress, permissionAbi, wallet);
    const metadata = new ethers.Contract(metadataAddress, metadataAbi, wallet);

    // Example Function Calls:

    // 1. **Registry Contract**: Register a user
    // const userKey = ethers.encodeBytes32String("UserKey1");
    // const role = "Patient"; // Role can be "CareProvider" or others
    // const registerTx = await registry.registerUser(userKey, role);
    // await registerTx.wait();
    // console.log("User registered successfully!");

    // 2. **Permission Contract**: Request permission
    const requester = wallet.address; // Your account
    const granter = "0x98c1334496614aed49d2e81526d089f7264fed9c"; // Replace with granter's address
    const periodReq = 30; // Request period in days
    const requestTx = await permission.requestPermission(requester, granter, periodReq);
    await requestTx.wait();
    console.log("Permission requested!");

    // 3. **Metadata Contract**: Add EHR Data
    const patientAddress = "0x98c1334496614aed49d2e81526d089f7264fed9c"; // Replace with a patient's address
    const key = ethers.encodeBytes32String("EHRKey1");
    const dataType = 0; // Corresponds to DataType.BloodTest
    const hashIndex = ethers.encodeBytes32String("Hash123");
    const encKey = ethers.encodeBytes32String("EncKey123");
    const addDataTx = await metadata.addEHRdata(patientAddress, key, dataType, hashIndex, encKey);
    await addDataTx.wait();
    console.log("EHR data added!");

    // 4. **Metadata Contract**: Get Patient Data
    const patientData = await metadata.getPatientData(patientAddress);
    console.log("Retrieved Patient Data:", patientData);
}

main().catch((err) => {
    console.error("Error:", err);
});
