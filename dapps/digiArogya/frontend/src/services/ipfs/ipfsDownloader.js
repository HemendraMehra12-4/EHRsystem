import { PinataSDK } from "pinata-web3";
const pinata = new PinataSDK({
    pinataJwt: import.meta.env.VITE_APP_PINATA_JWT,
    pinataGateway: import.meta.env.VITE_APP_PINATA_GATEWAY,
});

export const downloadFromIPFS = async (ipfsHash) => {
    try {
        const data = await pinata.gateways.get(ipfsHash);
        console.log(data);

        if (!data.data || !data.data.encryptedContent) {
            throw new Error('Invalid response format. Missing encryptedContent.');
        }

        const fileName = data.data.fileName;
        const fileType = data.data.fileType;
        const dataType = data.data.dataType;
        const encryptedContent = data.data.encryptedContent;

        return { encryptedContent, fileType, fileName, dataType };
    } catch (error) {
        console.error('IPFS download error:', error);
        throw new Error(`Failed to fetch file from IPFS: ${error.message}`);
    }
};
