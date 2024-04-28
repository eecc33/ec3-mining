const { mnemonicGenerate, cryptoWaitReady } = require("@polkadot/util-crypto");
const {Web3} = require("web3");
// 和合约交互用的账户，需要提前存入原生代币以支付gas费
const gasSeed = "evm账户_助记词";

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

const mining = async () => {
  console.log("now mining");

  // 使用 Web3.js 的例子
  const web3 = new Web3('https://rpcpc1-qa.agung.peaq.network');

  // 合约地址
  const contractAddress = "..."; // 仅供开发环境，激励合约地址
  // const contractAddress = "..."; // 激励合约地址
  // const contractAddress = "..."; // OLD 替换为实际的合约地址

  // 私钥
  const privateKey = "...";
  console.log("privateKey:::", privateKey);

  // 使用私钥创建以太坊账户
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  console.log("account address:::", account.address);

  const myContract = new web3.eth.Contract(contractAbiDev, contractAddress);

  const data = 200;
  const round = 99;

  console.log("do  start:::");
  const transactionObject = {
    from: account.address,
    to: contractAddress,
    gas: 500000,  //500000, // gas 限制
    gasPrice: 2000, //4100, // gas 价格
    // mining(round, did, amount);
    data: myContract.methods.mining(round, "...", data).encodeABI(),
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
    transactionObject.gasPrice = gasPrice * 2; // 将 gasPrice 设置为当前推荐值
    console.log("***Transaction Object gasPrice==:", gasPrice);

    // 使用 transactionObject 执行后续操作
    console.log("***Transaction Object:", transactionObject);
  } catch (error) {
    console.error("***Error:", error);
  }

  // console.log("do  signTransaction:::", web3.eth);
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

const getReward = async () => {
  console.log("now get reward");
  // 用于将某个设备的某一轮激励提取到指定以太坊地址

  // 调用激励合约中的getReward(address did, uint round, address user)方法
  // did和round同showReward
  // user为获得激励的以太坊账户
  // evm_getReward(did, round, user);

  // 使用 Web3.js 的例子
  const web3 = new Web3('https://rpcpc1-qa.agung.peaq.network');

  // 合约地址
  const contractAddress = "..."; // 仅供开发环境，激励合约地址
  // const contractAddress = "..."; // 激励合约地址
  // const contractAddress = "..."; // OLD 替换为实际的合约地址

  // 私钥
  const privateKey = "...";
  console.log("privateKey:::", privateKey);

  // 使用私钥创建以太坊账户
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  console.log("account address:::", account.address);

  const myContract = new web3.eth.Contract(contractAbiDev, contractAddress);
  console.log("do  start:::");
  const transactionObject = {
    from: account.address,
    to: contractAddress,
    gas: 500000,  //500000, // gas 限制
    gasPrice: 2000, //4100, // gas 价格
    // getReward(did, round, user);
    // round可以是101，102
    data: myContract.methods.getReward("...", 100, "...").encodeABI(),
    // data: myContract.methods.mint(5100).encodeABI(),
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
    transactionObject.gasPrice = gasPrice * 2; // 将 gasPrice 设置为当前推荐值
    console.log("***Transaction Object gasPrice==:", gasPrice);

    // 使用 transactionObject 执行后续操作
    console.log("***Transaction Object:", transactionObject);
  } catch (error) {
    console.error("***Error:", error);
  }

  // console.log("do  signTransaction:::", web3.eth);
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

const showReward = async () => {
  // 用于将某个设备的某一轮激励提取到指定以太坊地址

  // 调用激励合约中的getReward(address did, uint round, address user)方法
  // did和round同showReward
  // user为获得激励的以太坊账户
  // evm_getReward(did, round, user);

  /*
  const Wallet = require('ethereumjs-wallet');
  const bip39 = require('bip39');
  
  // 助记词
  const mnemonic = "..."; // 替换为您自己的助记词
  
  // 从助记词派生种子
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  
  // 通过种子创建 HDWallet
  // const hdwallet = hdkey.fromMasterSeed(seed);
  
  // 从助记词派生私钥
  // const seed = bip39.mnemonicToSeedSync(mnemonic);
  const wallet = Wallet.fromMnemonic(mnemonic);

  // 获取第一个钱包
  // const wallet = hdwallet.derivePath("m/44'/60'/0'/0/0").getWallet();
  
  // 获取私钥
  const privateKey = wallet.getPrivateKey();
  console.log("Private Key:", privateKey);
  
  // 将私钥转换为十六进制字符串
  const privateKeyHex = privateKey.toString('hex');
  
  console.log("Private Key HEX:", privateKeyHex);
  */

  // 使用 Web3.js 的例子
  const web3 = new Web3('https://rpcpc1-qa.agung.peaq.network');

  // 合约地址
  const contractAddress = "..."; // 仅供开发环境，激励合约地址
  // const contractAddress = "..."; // 激励合约地址
  // const contractAddress = "..."; // OLD 替换为实际的合约地址

  // 私钥
  const privateKey = "...";
  console.log("privateKey:::", privateKey);

  // 使用私钥创建以太坊账户
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  console.log("account address:::", account.address);

  const myContract = new web3.eth.Contract(contractAbiDev, contractAddress);
  console.log("do  start:::");

  let reward = "";
  await myContract.methods.showReward("...", 0).call((err, result) => {
    if (!err) {
      console.log('Function result: ', result);
      reward = result;
    } else {
      console.error('Error: ', err);
      reward = err;
    }
  });
  return reward;
};

const main = async () => {
  await cryptoWaitReady();
  await mining();
  await showReward();
  await getReward();
};

main();