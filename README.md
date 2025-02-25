# Run Besu Network and DigiArogya (EHR DApp) Locally

This guide will help you set up the **Hyperledger Besu Network** and run the **DigiArogya** decentralized application (EHR DApp) locally.

---

## **Step 1: Create and Run the Besu Network Locally**
Inspired by the [Hyperledger Besu Quickstart Template](https://besu.hyperledger.org/private-networks/tutorials/quickstart).

### **1.1 Install Necessary Tools**
Follow the steps in the official guide to set up dependencies such as:
- **Docker** (for running containers)
- **Node.js & npm** (for deploying smart contracts)

### **1.2 Start the Besu Network**
1. Open a terminal and navigate to the root project folder.
2. Run the following command to start the network:
   ```sh
   ./run.sh
   ```
3. Verify that the network is running by checking active containers:
   ```sh
   docker ps
   ```

---

## **Step 2: Set Up and Run the EHR DApp (DigiArogya)**

### **2.1 Deploy the Smart Contract**
1. Navigate to the smart contract directory:
   ```sh
   cd dapps/digiArogya
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Compile the smart contract:
   ```sh
   npm run compile
   ```
4. Deploy the smart contract:
   ```sh
   npm run deploy
   ```
   - You will see an output like:  
     **"Contract deployed at `<0xaddress>`"**  
   - Copy the contract address, as you will need it in the next step.

---

### **2.2 Set Up and Run the Frontend**
1. Navigate to the frontend directory:
   ```sh
   cd frontend
   ```
2. Copy the sample environment file and update values:
   ```sh
   cp .env.sample .env
   ```
   - Paste the **contract address** (from the previous step) into the `.env` file under:
     ```
     VITE_APP_CONTRACT_ADDRESS=<paste_address_here>
     ```
   - You will need to add relevant values like PINATA to access the IPFS setup.

3. Install frontend dependencies:
   ```sh
   npm install
   ```
   - If you encounter issues, try using the `--force` flag:
     ```sh
     npm install --force
     ```
4. Start the development server:
   ```sh
   npm run dev
   ```
5. Open the application in your browser at:
   ```
   http://localhost:5173/
   ```

---

🚀 **Congratulations! You have successfully set up the Besu network and deployed DigiArogya.** 🎉

