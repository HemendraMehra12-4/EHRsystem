
import { create } from "ipfs-http-client";

const ipfs = create({ url: import.meta.env.VITE_IPFS_API_URL });

export const uploadToIPFS = async (data) => {
  try {
    console.log("Uploading data to IPFS...");
    const { path } = await ipfs.add(data);
    console.log("Data uploaded to IPFS, hash:", path);
    return path;
  } catch (error) {
    console.error("IPFS upload failed:", error);
    throw new Error("Failed to upload data to IPFS.");
  }
};


export async function fetchDataFromIPFS(ipfsHash) {
    try {
        console.log("Fetching encrypted data from IPFS, Hash:", ipfsHash);
        
        const stream = ipfs.cat(ipfsHash);
        let data = "";

        for await (const chunk of stream) {
            data += new TextDecoder().decode(chunk);
        }

        console.log("Encrypted data fetched from IPFS.");
        return data; 
    } catch (error) {
        console.error("Error fetching data from IPFS:", error);
        throw new Error("Failed to retrieve data.");
    }
}

