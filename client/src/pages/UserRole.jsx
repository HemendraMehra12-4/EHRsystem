import { useState } from "react";
import { ethers } from "ethers";
import { Button } from "../components/ui/button";
import address from "../contracts/config/address";
import registry from "../contracts/config/Registry.json"

export default function UserRole() {
  const [account, setAccount] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const getUserRole = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contractAddress = address.registry;
    const contractAbi = registry.abi;

    const contract = new ethers.Contract(contractAddress, contractAbi, signer);
    const roleNum = await contract.getUserRole(account);
    const roleMapping = ["Patient", "CareProvider", "Researcher", "Regulator"];
    setUserRole(roleMapping[roleNum]);
  };

  const connectWallet = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    setAccount(accounts[0]);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Check User Role</h1>
      {account ? (
        <>
          <p>Connected: {account}</p>
          <Button onClick={getUserRole}>Get Role</Button>
          {userRole && <p className="mt-4">Your role: {userRole}</p>}
        </>
      ) : (
        <Button onClick={connectWallet}>Connect MetaMask</Button>
      )}
    </div>
  );
}
