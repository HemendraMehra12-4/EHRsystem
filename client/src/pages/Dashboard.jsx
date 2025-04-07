import { useState } from "react";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [account, setAccount] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Dashboard</h1>
        <p className="subtitle">
          Manage your data and permissions securely on the blockchain.
        </p>

        {account ? (
          <div className="wallet-info">
            <p><strong>Connected:</strong></p>
            <p className="wallet-address">{account}</p>
          </div>
        ) : (
          <Button onClick={connectWallet} className="connect-button">
            Connect MetaMask
          </Button>
        )}

        <nav className="nav-links">
          <Link to="/user-registration" className="nav-button">User Registration</Link>
          <Link to="/permissions-management" className="nav-button">Manage Permissions</Link>
          <Link to="/data-upload" className="nav-button">Upload Data</Link>
          <Link to="/data-retrieval" className="nav-button">Retrieve Data</Link>
        </nav>
      </div>
    </div>
  );
}
