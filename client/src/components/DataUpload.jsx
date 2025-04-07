import { useState } from "react";
import { ethers } from "ethers";
import { encryptDataWithAES, generateAESKey, encryptAESKeyWithECIES } from "../utils/encryption";
import { uploadToIPFS } from "../utils/ipfs";
import { Button } from "../components/ui/button";
import address from "../contracts/config/address";
import metadata from "../contracts/config/Metadata.json";
import "../styles/DataUpload.css";

export default function DataUpload() {
  const [account, setAccount] = useState(null);
  const [file, setFile] = useState(null);
  const [fullPublicKey, setFullPublicKey] = useState(null);
  const [userPublicKeyBytes32, setUserPublicKeyBytes32] = useState(null);
  const [dataType, setDataType] = useState("");

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    setAccount(accounts[0]);
  };

  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;
    console.log("File selected:", selectedFile.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      setFile(e.target.result);
      console.log("File read successfully");
    };
    reader.readAsText(selectedFile);
  };

  const handleKeyUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const pemData = e.target.result.trim();
        const match = pemData.match(/-----BEGIN PUBLIC KEY-----(.*?)-----END PUBLIC KEY-----/s);
        if (!match) throw new Error("Invalid PEM format");

        const fullPublicKey = match[0] + "\n";
        const publicKeyBytes32 = ethers.encodeBytes32String(fullPublicKey.substring(0, 31));

        console.log("Extracted Full Public Key:", fullPublicKey);
        console.log("Public Key (bytes32):", publicKeyBytes32);

        setFullPublicKey(fullPublicKey);
        setUserPublicKeyBytes32(publicKeyBytes32);
      } catch (error) {
        console.error("Error processing public key file:", error);
        alert("Invalid PEM file. Please upload a valid public key file.");
      }
    };
    reader.readAsText(file);
  };

  const handleChange = (event) => {
    setDataType(event.target.value.trim()); // Remove extra spaces
  };

  const uploadData = async () => {
    if (!account || !file || !fullPublicKey || !userPublicKeyBytes32 || !dataType) {
      alert("Please connect wallet, upload file, public key, and enter data type.");
      return;
    }

    try {
      console.log("Starting encryption...");

      // Generate AES key
      const aesKey = generateAESKey();
      console.log("Generated AES key:", aesKey);

      // Encrypt data with AES key
      const { encryptedData, iv } = encryptDataWithAES(file, aesKey);
      console.log("Data encrypted successfully");

      // Encrypt AES key with user's public key (ECIES)
      const encryptedAESKey = encryptAESKeyWithECIES(aesKey, fullPublicKey);
      console.log("Encryption complete. Proceeding with IPFS upload...");

      // Upload encrypted data to IPFS
      const ipfsHash = await uploadToIPFS(encryptedData);
      console.log("Data stored in IPFS with hash:", ipfsHash);

      // Convert encrypted AES key to bytes
      const encKeyBytes = ethers.toUtf8Bytes(encryptedAESKey);
      console.log("Encrypted AES Key (bytes):", encKeyBytes);

      // Convert dataType to bytes
      const dataTypeBytes = ethers.encodeBytes32String(dataType);


      // Store metadata on the blockchain
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(address.metadata, metadata.abi, signer);

      console.log("Sending transaction with:");
      console.log("User ID (bytes32):", userPublicKeyBytes32);
      console.log("Data Type (bytes):", dataTypeBytes);
      console.log("IPFS Hash:", ipfsHash);

      const tx = await contract.addEHRdata(userPublicKeyBytes32, dataTypeBytes, ipfsHash, encKeyBytes);
      await tx.wait();
      console.log("Transaction confirmed!");

      alert("Data uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Is the user registered?\n Check console for details.");
    }
  };

  return (
    <div className="data-upload-container">
      <div className="form-card">
        <h1 className="title">Upload Data</h1>
        {account ? (
          <>
            <p className="account-info">Connected: {account}</p>

            <label className="file-upload-label">
              Upload File:
              <input type="file" accept=".txt,.csv" onChange={handleFileUpload} className="file-input" />
            </label>

            <label className="file-upload-label">
              Upload Public Key:
              <input type="file" accept=".pem" onChange={handleKeyUpload} className="file-input" />
            </label>

            <input
              type="text"
              name="dataType"
              placeholder="Enter data type (e.g., COVID, XRay, etc.)"
              onChange={handleChange}
              className="text-input"
            />

            <Button onClick={uploadData} className="button-primary">Upload</Button>
          </>
        ) : (
          <Button onClick={connectWallet} className="button-primary">Connect MetaMask</Button>
        )}
      </div>
    </div>
  );
}
