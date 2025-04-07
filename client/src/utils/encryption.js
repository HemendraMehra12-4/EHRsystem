import forge from "node-forge";
import { ethers } from "ethers";

// Generate a symmetric AES key
export function generateAESKey() {
  console.log("Generating AES key...");
  return forge.random.getBytesSync(32); // 256-bit key
}

// Encrypt raw data using AES
export function encryptDataWithAES(rawData, aesKey) {
  console.log("Encrypting raw data using AES...");
  const cipher = forge.cipher.createCipher("AES-CBC", aesKey);
  const iv = forge.random.getBytesSync(16); // Initialization vector
  cipher.start({ iv });
  cipher.update(forge.util.createBuffer(rawData));
  cipher.finish();
  
  return { encryptedData: cipher.output.getBytes(), iv };
}

// Encrypt AES key using ECIES


export function encryptAESKeyWithECIES(aesKey, userPublicKey) {
  try {
    console.log("Encrypting AES key with ECIES...");

    if (!userPublicKey || typeof userPublicKey !== "string") {
      throw new Error("Invalid userPublicKey: Key is missing or not a string.");
    }

    // console.log("User Public Key:", userPublicKey);

    if (!aesKey || typeof aesKey !== "string") {
      throw new Error("Invalid aesKey: AES key is missing or not a string.");
    }

    console.log("AES Key:", aesKey);

    // Check if the key contains proper PEM format markers
    if (!userPublicKey.includes("-----BEGIN PUBLIC KEY-----") || 
        !userPublicKey.includes("-----END PUBLIC KEY-----")) {
      throw new Error("Public key is not in valid PEM format.");
    }

    try {
      const publicKey = forge.pki.publicKeyFromPem(userPublicKey);
      console.log("Public key parsed successfully.");
      
      const encryptedKey = publicKey.encrypt(aesKey, "RSA-OAEP");
      console.log("AES key encrypted successfully.");

      return forge.util.encode64(encryptedKey);
    } catch (pemError) {
      console.error("Failed to parse public key:", pemError);
      throw new Error("Invalid public key format or corruption.");
    }

  } catch (error) {
    console.error("Error in encryptAESKeyWithECIES:", error);
    return null;
  }
}



// Decrypt AES key using private key (RSA)
export function decryptAESKeyWithECIES(encryptedAESKey, userPrivateKey) {
  console.log("Decrypting AES key with private key...");
  const privateKey = forge.pki.privateKeyFromPem(userPrivateKey);
  const decryptedAESKey = privateKey.decrypt(forge.util.decode64(encryptedAESKey), "RSA-OAEP");

  return decryptedAESKey;
}

// Decrypt data using AES key
export function decryptDataWithAES(encryptedData, aesKey, iv) {
  console.log("Decrypting data using AES...");
  const decipher = forge.cipher.createDecipher("AES-CBC", aesKey);
  decipher.start({ iv });
  decipher.update(forge.util.createBuffer(encryptedData));
  decipher.finish();

  return decipher.output.toString();
}
