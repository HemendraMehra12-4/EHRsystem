import { useState } from "react";
import { ethers } from "ethers";
import forge from "node-forge";
import { Button } from "../components/ui/button";
import address from "../contracts/config/address";
import registry from "../contracts/config/Registry.json";
import "../styles/UserRegistration.css";

export default function UserRegistration() {
  const [account, setAccount] = useState(null);
  const [publicKey, setPublicKey] = useState(null);
  const [formattedKey, setFormattedKey] = useState(null);
  const [role, setRole] = useState("Patient");

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
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        console.log("File loaded successfully");

        const pemData = e.target.result.trim();
        // console.log("Raw PEM Data:", pemData);

        // Extract the public key correctly
        const match = pemData.match(/-----BEGIN PUBLIC KEY-----(.*?)-----END PUBLIC KEY-----/s);
        if (!match) throw new Error("Invalid PEM format");

        const fullPublicKey = match[0] + "\n"; // Ensure correct format
        // console.log("Extracted Full Public Key:", fullPublicKey);

        setPublicKey(fullPublicKey);

        // Convert to bytes32 format
        const publicKeyBytes = ethers.toUtf8Bytes(fullPublicKey.substring(0, 31));
        // console.log("Public Key Bytes (before encoding):", publicKeyBytes);

        const formatted = ethers.encodeBytes32String(fullPublicKey.substring(0, 31));
        console.log("Formatted Public Key (bytes32):", formatted);
        setFormattedKey(formatted);
      } catch (error) {
        console.error("Error processing PEM file:", error);
        alert("Invalid PEM file. Please upload a valid public key file.");
      }
    };
    reader.readAsText(file);
  };

  const registerUser = async () => {
    if (!account || !formattedKey) {
      alert("Please connect your wallet and upload a valid public key file.");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(address.registry, registry.abi, signer);

    try {
      console.log("Sending transaction with key:", formattedKey);
      const tx = await contract.registerUser(formattedKey, role);
      await tx.wait();
      alert("User registered successfully!");
    } catch (error) {
      console.error("Registration failed:", error);
      alert("User already registered to the network!");
    }
  };

  const generateKeyPair = () => {
    const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
    const privateKeyPem = forge.pki.privateKeyToPem(keyPair.privateKey);
    const publicKeyPem = forge.pki.publicKeyToPem(keyPair.publicKey);

    const element = document.createElement("a");
    const file = new Blob([privateKeyPem + "\n" + publicKeyPem], {
      type: "text/plain",
    });
    element.href = URL.createObjectURL(file);
    element.download = "my_keys.pem";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="user-registration-container">
      <div className="form-card">
        <h1 className="title">User Registration</h1>
        {account ? (
          <>
            <p className="account-info">Connected: {account}</p>

            <label className="file-upload-label">
              Upload Public Key (PEM):
              <input type="file" accept=".pem" onChange={handleFileUpload} className="file-input" />
            </label>

            {publicKey && (
              <div className="key-preview">
                <p>Public Key Loaded:</p>
                <textarea readOnly value={publicKey} className="key-textarea"></textarea>
              </div>
            )}

            <select value={role} onChange={(e) => setRole(e.target.value)} className="select-field">
              <option value="Patient">Patient</option>
              <option value="CareProvider">Care Provider</option>
              <option value="Researcher">Researcher</option>
              <option value="Regulator">Regulator</option>
            </select>

            <Button onClick={registerUser} className="button-primary">Register User</Button>
          </>
        ) : (
          <Button onClick={connectWallet} className="button-primary">Connect MetaMask</Button>
        )}
        <p className="generate-keys-text">Don't have a key file? Generate one:</p>
        <Button onClick={generateKeyPair} className="button-secondary">
          Generate Keys
        </Button>
      </div>
    </div>
  );
}
