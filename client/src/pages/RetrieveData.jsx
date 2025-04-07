import React, { useState } from "react";
import { retrieveData } from "../components/DataRetrieval";


const RetrieveData = () => {
  const [privateKeyFile, setPrivateKeyFile] = useState(null);
  const [publicKeyFile, setPublicKeyFile] = useState(null);
  const [retrievedData, setRetrievedData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event, type) => {
    if (type === "private") {
      setPrivateKeyFile(event);
    } else if (type === "public") {
      setPublicKeyFile(event);
    }
  };

  const handleRetrieve = async () => {
    if (!privateKeyFile || !publicKeyFile) {
      alert("Please upload both private and public key files.");
      return;
    }

    setLoading(true);
    try {
      const data = await retrieveData(privateKeyFile, publicKeyFile);
      if (data) {
        setRetrievedData(data);
      } else {
        alert("No data found or failed to retrieve.");
      }
    } catch (error) {
      console.error("❌ Retrieval error:", error);
      alert("Error retrieving data.");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Retrieve Data</h2>
      <input type="file" accept=".pem" onChange={(e) => handleFileChange(e, "private")} />
      <input type="file" accept=".pem" onChange={(e) => handleFileChange(e, "public")} />
      <button onClick={handleRetrieve} disabled={loading}>
        {loading ? "Retrieving..." : "Retrieve Data"}
      </button>

      {retrievedData.length > 0 && (
        <div>
          <h3>Retrieved Data</h3>
          <ul>
            {retrievedData.map((item, index) => (
              <li key={index}>
                <strong>{item.dataType}:</strong> {item.data}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RetrieveData;


