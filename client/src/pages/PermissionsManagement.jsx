import { useState } from "react";
import { ethers } from "ethers";
import { Button } from "../components/ui/button";
import address from "../contracts/config/address";
import permission from "../contracts/config/Permission.json";

export default function PermissionsManagement() {
  const [account, setAccount] = useState(null);
  const [targetUser, setTargetUser] = useState("");
  const [permission, setPermission] = useState(false);

  const updatePermission = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contractAddress = address.permission;
    const contractAbi = permission.abi;

    const contract = new ethers.Contract(contractAddress, contractAbi, signer);
    const tx = await contract.setPermission(targetUser, permission);
    await tx.wait();
    alert("Permission updated successfully!");
  };

  const connectWallet = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    setAccount(accounts[0]);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Manage Permissions</h1>
      {account ? (
        <>
          <p>Connected: {account}</p>
          <input
            type="text"
            placeholder="Enter target user address"
            value={targetUser}
            onChange={(e) => setTargetUser(e.target.value)}
            className="mt-4 p-2 rounded text-black"
          />
          <label className="mt-2">
            <input
              type="checkbox"
              checked={permission}
              onChange={(e) => setPermission(e.target.checked)}
              className="mr-2"
            />
            Grant Permission
          </label>
          <Button onClick={updatePermission} className="mt-4">
            Update Permission
          </Button>
        </>
      ) : (
        <Button onClick={connectWallet}>Connect MetaMask</Button>
      )}
    </div>
  );
}
