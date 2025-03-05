# 🚀 **Run Besu Network and DigiArogya (EHR DApp), and Benchmarking Locally**

This guide will help you set up the **Hyperledger Besu Network**, run the **DigiArogya** decentralized application (EHR DApp), and perform benchmarking using **Hyperledger Caliper** locally.

---

## 📌 **Step 1: Create and Run the Besu Network Locally**

Inspired by the [Hyperledger Besu Quickstart Template](https://besu.hyperledger.org/private-networks/tutorials/quickstart).

### 🔹 **1.1 Install Necessary Tools**

Ensure you have the following dependencies installed:

- **Docker** (for running containers)
- **Node.js & npm** (for deploying smart contracts)

👉 Follow the official guide for installation instructions if you haven't already.

### 🔹 **1.2 Start the Besu Network**

1. Open a terminal and navigate to the root project folder.
2. Run the following command to start the network:
   ```sh
   ./run.sh
   ```
3. Verify that the network is running by checking active containers:
   ```sh
   docker ps
   ```

If everything is set up correctly, you should see the Besu network containers running.

---

## 📌 **Step 2: Set Up and Run the EHR DApp (DigiArogya)**

### 🔹 **2.1 Deploy the Smart Contract**

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
   - You will see an output like: **"Contract deployed at `<0xaddress>`"**
   - **Copy the contract address**, as you will need it in the next step.

---

### 🔹 **2.2 Set Up and Run the Frontend**

1. Navigate to the frontend directory:
   ```sh
   cd frontend
   ```
2. Copy the sample environment file and update values:

   ```sh
   cp .env.sample .env
   ```

   - Open `.env` in a text editor and **paste the contract address** from the previous step:
     ```
     VITE_APP_CONTRACT_ADDRESS=<paste_address_here>
     ```
   - Add any required values, such as **Pinata API keys** for IPFS storage.

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
5. Open the application in your browser:
   ```
   http://localhost:5173/
   ```

🎉 **Your decentralized EHR application is now running locally!**

---

## 📌 **Step 3: Benchmarking the App with Caliper**

### 🔹 **3.1 Bind and Install Required Dependencies**

1. Navigate to the caliper directory:
   ```sh
   cd caliper
   ```
2. Bind Caliper with Besu:
   ```sh
   npx caliper bind --caliper-bind-sut besu:latest
   ```
3. Install Caliper core:
   ```sh
   npm install @hyperledger/caliper-core
   ```

---

### 🔹 **3.2 Set Up The Environment**

1. Copy the `"abi"` value from `dapps/digiArogya/artifacts/contracts/EHRmain.sol/EHRmain.json` and paste it into `caliper/network-config/besu-network.json`.

2. Paste the **contract address** (from the previous step) into the `"address"` field of: `caliper/network-config/besu-network.json`

---

### 🔹 **3.3 Run Benchmarking**

1. From the `caliper` directory, run:
   ```sh
   npx caliper launch manager --caliper-workspace . --caliper-networkconfig ./network-config/besu-network.json --caliper-benchconfig ./benchmark-config/simple-benchmark.yaml --caliper-flow-skip-install
   ```

📊 **Caliper will now evaluate the performance of the Besu network running DigiArogya!**

---

✅ **Congratulations! You have successfully set up the Besu network, deployed DigiArogya, and benchmarked its performance.** 🎉
