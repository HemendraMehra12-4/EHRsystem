import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Button } from "../components/ui/button";
import address from "../contracts/config/address";
import notification from "../contracts/config/NotificationManager.json"

export default function Notifications() {
  const [account, setAccount] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (account) {
      fetchNotifications();
    }
  }, [account]);

  const fetchNotifications = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contractAddress = address.notification;
    const contractAbi = notification.abi;

    const contract = new ethers.Contract(contractAddress, contractAbi, signer);
    const userNotifications = await contract.getNotifications(account);
    setNotifications(userNotifications);
  };

  const connectWallet = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    setAccount(accounts[0]);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Notifications</h1>
      {account ? (
        <>
          <p>Connected: {account}</p>
          <Button onClick={fetchNotifications}>Refresh Notifications</Button>
          <ul className="mt-4 bg-gray-800 p-4 rounded-lg w-96">
            {notifications.length > 0 ? (
              notifications.map((notif, index) => (
                <li key={index} className="border-b border-gray-600 py-2">
                  {notif}
                </li>
              ))
            ) : (
              <p>No new notifications</p>
            )}
          </ul>
        </>
      ) : (
        <Button onClick={connectWallet}>Connect MetaMask</Button>
      )}
    </div>
  );
}
