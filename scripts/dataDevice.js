const { mnemonicGenerate, cryptoWaitReady } = require("@polkadot/util-crypto");
const {
  createStorageKeys,
  generateKeyPair,
  getNetworkApi,
  makePalletQuery,
  sendTransaction,
} = require("./commonFunctions");
const { networks } = require("./constants");
// 需要更换为有原生代币的助记词
const gasSeed = "...";
const fs = require('fs');

const getMachineKeyPair = async () => {
  console.log("Fetching machine key pair from seed.txt...");
  if (fs.existsSync("seed.txt")) {
    const seed = fs.readFileSync("seed.txt", "utf8");
    if (seed) return generateKeyPair(seed);
  }

  console.log("No seed found, generating new key pair...");
  const seed = mnemonicGenerate();

  const pair = generateKeyPair(seed);
  fs.writeFileSync("seed.txt", seed);
  console.log("New key pair generated and saved to seed.txt");
  return pair;
};

const getTimestamp = async () => {
  if (fs.existsSync("timestamp.txt")) {
    const tmp = fs.readFileSync("timestamp.txt", "utf8");
    const nextTmp = parseInt(tmp, 10) + 10 * 1000;
    fs.writeFileSync("timestamp.txt", nextTmp.toString());
    return tmp;
  }
  else {
    console.log("No timestamp found...");
    return 0;
  }
};

const getData = async () => {
  if (fs.existsSync("data.txt")) {
    return fs.readFileSync("data.txt", "utf8");
  }
  else {
    console.log("No data found...");
    return 0;
  }
};

const getStorageFromQuery = async (itemType) => {
  const machineAddress = generateKeyPair(gasSeed).address;

  const { hashed_key } = createStorageKeys([
    { value: machineAddress, type: 0 },
    { value: itemType, type: 1 },
  ]);

  const checkIfExists = await makePalletQuery("peaqStorage", "itemStore", [
    hashed_key,
  ]);
  return checkIfExists;
};

const callStoragePallet = async (itemType, value, action) => {
  try {
    const api = await getNetworkApi(networks.PEAQ);
    const keyPair = generateKeyPair(gasSeed);

    const onChainNonce = (
      await api.rpc.system.accountNextIndex(generateKeyPair(gasSeed).address)
    ).toBn();

    const extrinsic = api.tx.peaqStorage[action](itemType, value);

    const hash = sendTransaction(extrinsic, keyPair, onChainNonce);
    console.log("hash", hash);
    return hash;
  } catch (error) {
    console.error("Error storing data on chain", error);
  }
};

const uploadData = async () => {
  try {
    const pair = await getMachineKeyPair();
    const did = pair.address;
    const timestamp = await getTimestamp();
    // const timestamp = 1711186169;
    if (timestamp == 0) {
      throw new Error("timestamp error");
    }
    const itemType = did + "_" + timestamp;
    const item = await getData();
    const checkIfExists = await getStorageFromQuery(itemType);
    const actionType = checkIfExists && !checkIfExists?.isStorageFallback ? "updateItem" : "addItem";

    await callStoragePallet(itemType, item, actionType);
  } catch (error) {
    console.error('Error---', error);
  }
};

const main = async () => {
  await cryptoWaitReady();
  await uploadData();
};

main();

{}