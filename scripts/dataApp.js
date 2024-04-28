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

const getMachineKeyPair = async () => {
  // 未做多设备适配
  console.log("Fetching machine key pair from device1_seed.txt...");
  if (fs.existsSync("device1_seed.txt")) {
    const seed = fs.readFileSync("device1_seed.txt", "utf8");
    if (seed) return generateKeyPair(seed);
  }

  console.log("No seed found, generating new key pair...");
  const seed = mnemonicGenerate();

  const pair = generateKeyPair(seed);
  fs.writeFileSync("device1_seed.txt", seed);
  console.log("New key pair generated and saved to seed.txt");
  return pair;
};

const getTimestamp = async () => {
  if (fs.existsSync("timestamp.txt")) {
    const tmp = fs.readFileSync("timestamp.txt", "utf8");
    return tmp;
  }
  else {
    console.log("No timestamp found...");
    return 0;
  }
};

const getStorageFromQuery = async (itemType) => {
  const machineAddress = generateKeyPair(seed).address;

  const { hashed_key } = createStorageKeys([
    { value: machineAddress, type: 0 },
    { value: itemType, type: 1 },
  ]);

  const checkIfExists = await makePalletQuery("peaqStorage", "itemStore", [
    hashed_key,
  ]);
  return checkIfExists;
};

const downloadData = async () => {
  try {
    const pair = await getMachineKeyPair();
    const did = pair.address;
    let timestamp = await getTimestamp();
    if (timestamp == 0) {
      // timestamp没对上，要重新匹配
      throw new Error("timestamp error");
    }

    for (let i = 0;; i++) {
      const itemType = did + "_" + timestamp;
      const item = await getStorageFromQuery(itemType);
      
      if (!(item && !item?.isStorageFallback)){
        fs.writeFileSync("timestamp.txt", timestamp);
        break;
      }
      else{
        const timestamp = parseInt(timestamp, 10) + 10 * 1000;
        console.log("current item on chain is: ", String.fromCharCode(...item));
        const data = String.fromCharCode(...item);
        // 上链数据待解析，后续用于激励
      }
    }
  } catch (error) {
    console.error('Error---', error);
  }
};

const main = async () => {
  await cryptoWaitReady();
  await downloadData();
};

main();
