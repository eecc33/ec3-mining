const { mnemonicGenerate, cryptoWaitReady } = require("@polkadot/util-crypto");
const {
  createStorageKeys,
  generateKeyPair,
  getNetworkApi,
  makePalletQuery,
  sendTransaction,
} = require("./commonFunctions");
const { networks } = require("./constants");
const { Web3 } = require("web3");
const fs = require('fs');
const { exit } = require("process");
const Keyring = require('@polkadot/keyring').default;
// import { KeyringPair } from '@polkadot/keyring/types';
// import { Web3 } from 'web3';
// !!!需要更换为有原生代币的助记词以支付gas费
const gasSeed = "...";

const contractAbiDev = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "allowance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "needed",
        "type": "uint256"
      }
    ],
    "name": "ERC20InsufficientAllowance",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "balance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "needed",
        "type": "uint256"
      }
    ],
    "name": "ERC20InsufficientBalance",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "approver",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidApprover",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidReceiver",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidSender",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidSpender",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentRound",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "did",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "round",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getReward",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "miner",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "round",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "did",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "mining",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "did",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "round",
        "type": "uint256"
      }
    ],
    "name": "showReward",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const getMachineKeyPair = async () => {
  // 未做多设备适配
  console.log("Fetching machine key pair from device1_seed.txt...");
  if (fs.existsSync("device1_seed.txt")) {
    const seed = fs.readFileSync("device1_seed.txt", "utf8");
    const keyring = new Keyring({ type: 'sr25519' });
    const pair = keyring.addFromUri(seed);
    console.log(pair.address);
    if (seed) return seed;
  }

  console.log("No seed found, generating new key pair...");
  const seed = mnemonicGenerate();
  fs.writeFileSync("device1_seed.txt", seed);
  console.log("New key pair generated and saved to seed.txt");
  return seed;
};

const seedToPrivateKey = async () => {
  const bip39 = require('bip39');
  const hdkey = require('ethereumjs-wallet/hdkey');

  // 从助记词生成种子
  const seed = bip39.mnemonicToSeedSync(gasSeed);

  // 从种子生成HD Wallet
  const hdWallet = hdkey.fromSeed(seed);

  // 生成第一个账户的私钥
  const key0 = hdWallet.derive("m/44'/60'/0'/0/0");

  // 输出公钥
  console.log(key0.getPrivateKey().toString('hex'));

  return key0.getPrivateKey().toString('hex');
};

const seedToPublicKey = async (devSeed) => {
  const bip39 = require('bip39');
  const hdkey = require('ethereum-hdwallet');

  // 从助记词生成种子
  const seed = await bip39.mnemonicToSeedSync(devSeed);

  // 从种子生成HD Wallet
  const hdWallet = hdkey.fromSeed(seed);

  // 生成第一个账户的私钥
  const key0 = hdWallet.derive("m/44'/60'/0'/0/0");

  // 输出公钥
  console.log(key0.getAddress().toString('hex'));

  return key0.getAddress().toString('hex');
};

const mining = async () => {
  console.log("now mining");

  // iotex-mainnet: https://babel-api.mainnet.iotex.io
  // iotex-testnet: https://babel-api.testnet.iotex.io
  const web3 = new Web3('https://babel-api.testnet.iotex.io');

  // !!! 仅供开发环境，激励合约地址
  const contractAddress = "...";
  const myContract = new web3.eth.Contract(contractAbiDev, contractAddress);

  // 由助记词生成私钥，再使用私钥创建以太坊账户
  // const privateKey = await seedToPrivateKey();
  const privateKey = "...";
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  console.log("account address:::", account.address);

  // 准备设备助记词
  const devSeed = await getMachineKeyPair();
  const deviveEvmAddr = await seedToPublicKey(devSeed);
  // const deviveEvmAddr = "...";

  // !!! 需要更换为实际数据
  const data = 300;

  // 读取当前激励轮数
  let currentRound = 0;
  await myContract.methods.currentRound().call()
    .then(function (value) {
      console.log("currentRound is:", value);
      currentRound = value;
    })
    .catch(function (error) {
      console.error("Error reading currentRound:", error);
    });

  const transactionObject = {
    from: account.address,
    to: contractAddress,
    gas: 500000,  //500000, // gas 限制
    gasPrice: 2000, //4100, // gas 价格
    // mining(round, did, amount);
    data: myContract.methods.mining(currentRound, deviveEvmAddr, data).encodeABI(),
    value: 0,
  };
  console.log("tx object created");

  try {
    // 获取 gas
    const gas = await web3.eth.estimateGas(transactionObject);
    transactionObject.gas = gas; // 将 gas 设置为估算值
    console.log("***Transaction Object gas==:", gas);

    // 获取 gasPrice
    const gasPrice = await web3.eth.getGasPrice();
    transactionObject.gasPrice = gasPrice; // 将 gasPrice 设置为当前推荐值
    console.log("***Transaction Object gasPrice==:", gasPrice);

    // 使用 transactionObject 执行后续操作
    console.log("***Transaction Object:", transactionObject);
  } catch (error) {
    console.error("***Error:", error);
  }

  // 使用以太坊账户签署交易
  web3.eth.accounts.signTransaction(transactionObject, account.privateKey)
    .then((signedTransaction) => {
      // 发送签名交易到区块链
      console.log(signedTransaction)
      web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
        .on('transactionHash', (hash) => {
          console.log('*********Transaction Hash:', hash);
        })
        .on('receipt', (receipt) => {
          console.log('*********Transaction Receipt:', receipt);
        })
        .on('error', (error) => {
          console.error('*********Transaction Error:', error);
        });
    })
    .catch((error) => {
      console.error('*********Signing Error:', error);
    });
};

const main = async () => {
  await cryptoWaitReady();
  await mining();
};

main();
