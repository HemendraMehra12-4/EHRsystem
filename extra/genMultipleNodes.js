const secp256k1 = require('secp256k1');
const keccak = require('keccak');
const { randomBytes } = require('crypto');
const fs = require('fs');
const path = require('path');
const Wallet = require('ethereumjs-wallet');
const yargs = require('yargs/yargs');

const n = 10; // number of nodes
const startIP = 44; // Starting IP address for nodes
const staticNodesFile = path.join(__dirname, 'static-nodes.json');
const permissionConfigFile = path.join(__dirname, 'permissions_config.toml');

// Helper function to append data to JSON file
function appendToFile(filePath, data) {
  let fileContent = [];
  
  if (fs.existsSync(filePath)) {
    const rawContent = fs.readFileSync(filePath);
    fileContent = JSON.parse(rawContent);
  }
  
  fileContent.push(data);
  fs.writeFileSync(filePath, JSON.stringify(fileContent, null, 2));
}

// Helper function to append data to TOML file
function appendToTOMLFile(filePath, data) {
  let fileContent = '';

  if (fs.existsSync(filePath)) {
    fileContent = fs.readFileSync(filePath, 'utf8');
  }

  // Extract existing enodes
  const match = fileContent.match(/nodes-allowlist=\[\s*([\s\S]*?)\s*\]/);
  let enodes = match ? match[1].split(',').map(e => e.trim().replace(/^"|"$/g, '')) : [];

  // Avoid duplicates
  if (!enodes.includes(data)) {
    enodes.push(data);
  }

  // Reformat the TOML output
  const newTOMLContent = `nodes-allowlist=[\n${enodes.map(e => `"${e}"`).join(",\n")}\n]`;
  fs.writeFileSync(filePath, newTOMLContent);
}

function generatePrivateKey() {
  let privKey;
  do {
    privKey = randomBytes(32);
  } while (!secp256k1.privateKeyVerify(privKey));
  return privKey;
}

function derivePublicKey(privKey) {
  let pubKey = secp256k1.publicKeyCreate(privKey, false).slice(1);
  return Buffer.from(pubKey);
}
  
function deriveAddress(pubKey) {
  let keyHash = keccak('keccak256').update(pubKey).digest();
  return keyHash.slice(Math.max(keyHash.length - 20, 1));
}
  
async function generateNodeData(nodeIndex, password) {
  let privateKey = generatePrivateKey();
  let publicKey = derivePublicKey(privateKey);
  let address = deriveAddress(publicKey);
  
  // Generate IP address for the node
  const ipAddress = `172.16.239.${startIP + nodeIndex}`;
  const enodeURL = `enode://${publicKey.toString('hex')}@${ipAddress}:30303`;

  const nodeDir = path.join(__dirname, "../config/nodes", `newnode${nodeIndex + 1+3}`);
  if (!fs.existsSync(nodeDir)) {
    fs.mkdirSync(nodeDir);
  }
  
  console.log(`Node ${nodeIndex + 1} keys created, writing to folder...`);
  fs.writeFileSync(path.join(nodeDir, "nodekey"), privateKey.toString('hex'));
  fs.writeFileSync(path.join(nodeDir, "nodekey.pub"), publicKey.toString('hex'));
  fs.writeFileSync(path.join(nodeDir, "address"), address.toString('hex'));
  
  // Generate Ethereum account for each node
  const wallet = Wallet['default'].generate();
  const v3keystore = await wallet.toV3(password);
  console.log(`Account for Node ${nodeIndex + 1} created, writing to folder...`);
  fs.writeFileSync(path.join(nodeDir, "accountKeystore"), JSON.stringify(v3keystore));
  fs.writeFileSync(path.join(nodeDir, "accountPrivateKey"), wallet.getPrivateKeyString());
  fs.writeFileSync(path.join(nodeDir, "accountPassword"), password);
  
  // Append the enode URL to the JSON and TOML files
  appendToFile(staticNodesFile, enodeURL);
  appendToTOMLFile(permissionConfigFile, enodeURL);
}

async function main(password) {
  for (let i = 0; i < n; i++) {
    await generateNodeData(i, password);
  }
}

try {
  const args = yargs(process.argv.slice(2)).options({
    password: { type: 'string', demandOption: false, default: '', describe: 'Password for the account' }
  }).argv;
  main(args.password);
} catch (e) {
  console.error(e);
}
