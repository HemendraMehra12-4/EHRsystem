import { ethers } from "ethers";
import { create } from "ipfs-http-client";
import {
    decryptAESKeyWithECIES,
    decryptDataWithAES
} from "../utils/encryption.js"; // Now using the existing utility functions
import contractABI from "../contracts/config/Metadata.json";
import address from "../contracts/config/address.js";

// IPFS Client
const ipfs = create({ url: import.meta.env.VITE_IPFS_API_URL });

// Read Private Key
async function readPrivateKey(event) {
    return new Promise((resolve, reject) => {
        const file = event.target.files[0];
        if (!file) {
            reject("❌ No file selected.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const pemData = e.target.result.trim();
                const match = pemData.match(/-----BEGIN PRIVATE KEY-----(.*?)-----END PRIVATE KEY-----/s);
                if (!match) throw new Error("Invalid PEM format");

                const fullPrivateKey = match[0] + "\n";
                console.log("🔑 Extracted Full Private Key:", fullPrivateKey);
                resolve(fullPrivateKey);
            } catch (error) {
                console.error("❌ Error processing private key file:", error);
                reject("Invalid PEM file. Please upload a valid private key file.");
            }
        };
        reader.readAsText(file);
    });
}

// Read Public Key & Extract bytes32 User Key
async function readPublicKey(event) {
    return new Promise((resolve, reject) => {
        const file = event.target.files[0];
        if (!file) {
            reject("❌ No file selected.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const pemData = e.target.result.trim();
                const match = pemData.match(/-----BEGIN PUBLIC KEY-----(.*?)-----END PUBLIC KEY-----/s);
                if (!match) throw new Error("Invalid PEM format");

                const fullPublicKey = match[0] + "\n";
                const userKey = ethers.encodeBytes32String(fullPublicKey.substring(0, 31));

                console.log("🔑 Extracted Full Public Key:", fullPublicKey);
                console.log("🛠 Converted User Key (bytes32):", userKey);
                resolve({ fullPublicKey, userKey });
            } catch (error) {
                console.error("❌ Error processing public key file:", error);
                reject("Invalid PEM file. Please upload a valid public key file.");
            }
        };
        reader.readAsText(file);
    });
}

// Function to retrieve data
export async function retrieveData(privateKeyEvent, publicKeyEvent) {
    try {
        console.log("🔑 Reading private key...");
        const privateKey = await readPrivateKey(privateKeyEvent);

        console.log("🔑 Reading public key...");
        const { fullPublicKey, userKey } = await readPublicKey(publicKeyEvent);

        console.log("🔍 Retrieving data for userKey:", userKey);

        // Connect to Ethereum provider
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(address.metadata, contractABI, signer);

        // Call smart contract to get stored data
        console.log("📡 Calling searchData...");
        const [dataTypes, HIList, encKeys] = await contract.searchData(userKey);
        console.log("✅ Data received from contract.");

        if (HIList.length === 0) {
            console.warn("⚠️ No data found for this user.");
            return null;
        }

        let results = [];
        for (let i = 0; i < HIList.length; i++) {
            console.log(`📂 Fetching encrypted data from IPFS: ${HIList[i]}`);
            const file = await ipfs.cat(HIList[i]);
            let encryptedData = new TextDecoder().decode(file);

            console.log("🔓 Decrypting AES key...");
            const aesKey = decryptAESKeyWithECIES(encKeys[i], privateKey);

            // Ensure the first 16 bytes are IV (as done in encryption)
            const iv = encryptedData.slice(0, 16);
            const encryptedContent = encryptedData.slice(16);

            console.log("🔓 Decrypting data...");
            const originalData = decryptDataWithAES(encryptedContent, aesKey, iv);

            results.push({
                dataType: dataTypes[i],
                data: originalData,
            });

            console.log(`✅ Successfully retrieved and decrypted data for type: ${dataTypes[i]}`);
        }

        return results;
    } catch (error) {
        console.error("❌ Error retrieving data:", error);
        return null;
    }
}
