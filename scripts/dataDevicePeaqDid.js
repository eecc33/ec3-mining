const { mnemonicGenerate, cryptoWaitReady } = require("@polkadot/util-crypto");
const {
  createStorageKeys,
  generateKeyPair,
  getNetworkApi,
  getPeaqKeyPair,
} = require("./commonFunctions");
const { networks } = require("./constants");
const gasSeed =
  "...";
const fs = require("fs");
const { Sdk } = require("@peaq-network/sdk");

const createPeaqDID = async (name, seed) => {
  const didFilePath = "peaqDid.txt";
  if (fs.existsSync(didFilePath)) {
    const storedDid = fs.readFileSync(didFilePath, "utf8");
    console.log("Found existing PEAQ DID in file:", storedDid);
    return storedDid;
  }

  const sdkInstance = await Sdk.createInstance({
    baseUrl: "wss://wsspc1-qa.agung.peaq.network",
    seed,
  });

  const { hash } = await sdkInstance.did.create({ name });
  console.log("DID created", hash);
  fs.writeFileSync(didFilePath, hash, "utf8");
  console.log("New PEAQ DID saved to file");
  await sdkInstance.disconnect();

  return hash;
};

const callDIDPallet = async (address, key, value, action) => {
  try {
    const api = await getNetworkApi(networks.PEAQ);
    const datain = JSON.stringify(value);
    const data = api.tx.peaqDid[action](address, key, datain, "").signAndSend(
      getPeaqKeyPair(),
      ({ status, events, dispatchError }) => {
        if (dispatchError) {
          if (dispatchError.isModule) {
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { docs, name, section } = decoded;

            console.log(`${section}.${name}: ${docs.join(" ")}`);
          } else {
            console.log(dispatchError.toString());
          }
          console.log(
            "---------DID document failed to save to network!----------"
          );
        }
        console.log("---------DID document saved to network!----------");
      }
    );
    return data;
  } catch (error) {
    console.log("===await SUB_API.tx.peaqDid.addAttribute==error===", error);
  }
};

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
  } else {
    console.log("No timestamp found...");
    return 0;
  }
};

const getData = async () => {
  if (fs.existsSync("data.txt")) {
    return fs.readFileSync("data.txt", "utf8");
  } else {
    console.log("No data found...");
    return 0;
  }
};

const getAttributeFromQuery = async (key, value) => {
  const api = await getNetworkApi(networks.PEAQ);
  const { hashed_key } = createStorageKeys([
    {
      value: key,
      type: 1,
    },
    { value: value, type: 1 },
  ]);

  const checkIfExists = await api.query?.["peaqDid"]?.["attributeStore"](
    hashed_key
  );

  return checkIfExists;
};

const uploadData = async () => {
  try {
    const pair = await getMachineKeyPair();
    const address = pair.address;
    const didName = "Ec-test9-" + address;
    const mnemonicSeed = gasSeed;
    console.log(
      "creating peaqDID with name",
      didName,
      "and seed",
      mnemonicSeed
    );
    const peaqDID = await createPeaqDID(didName, mnemonicSeed);
    console.log(`Created peaq DID: ${peaqDID}`);
    const timestamp = await getTimestamp();
    if (timestamp == 0) {
      throw new Error("timestamp error");
    }
    const item = await getData();
    const checkIfExists = await getAttributeFromQuery(didName, item);
    const actionType =
      checkIfExists && !checkIfExists?.isStorageFallback
        ? "updateAttribute"
        : "addAttribute";
    await callDIDPallet(peaqDID, didName, item, actionType);
  } catch (error) {
    console.error("Error---", error);
  }
};

const main = async () => {
  await cryptoWaitReady();
  await uploadData();
};

main();
