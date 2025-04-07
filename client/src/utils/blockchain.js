import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_BESU_RPC_URL);

export const getAccounts = async () => {
    const accounts = await provider.listAccounts();
    return accounts;
};
