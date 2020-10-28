const path = require('path');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx').Transaction;
const Link_api = "https://mainnet.infura.io/v3/c46076a7223549b1bf177631e1510229"; // "https://mainnet.infura.io/v3/5a86583c78cc44a4836625ea7f048e42"; //'https://mainnet.infura.io/v3/73707007b7d74be6a1168fff361ee670';
const web3 = new Web3(Link_api);
var axios = require('axios');
const VARIABLE = require(path.join(__dirname, '../variable'))
var conn = ""; // get tới sql

const USDT_CONTRACT = '0xdac17f958d2ee523a2206206994597c13d831ec7';
const KNC_CONTRACT = '0xdd974d5c2e2928dea5f71b9825b8b646686bd200';
const MCH_CONTRACT = '0xa5e262ec733051b14b38901901a82f2684637e78';
const FEE_ERC20 = 0.0025;
const TRX_FEE = 1000000;

async function sqlPromise(sql){
    return new Promise( ( resolve, reject ) => {
              conn.query( sql, ( err, rows ) => {
                  if ( err )
                      return reject( err );
                  resolve( rows );
              } );
          } );
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

const waitFor = (ms) => new Promise(r => setTimeout(r, ms));

// const showABI = () => {
//     const abi = [ { "constant": true, "inputs": [], "name": "name", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "approve", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "transferFrom", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [ { "name": "", "type": "uint8" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "_owner", "type": "address" } ], "name": "balanceOf", "outputs": [ { "name": "balance", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "transfer", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" } ], "name": "allowance", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" } ], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" } ], "name": "Transfer", "type": "event" } ];
//     return abi;
// }

const createERCWallet = async () => {
    var erc20_wallet = await web3.eth.accounts.create();
    return {
        address: erc20_wallet.address,
        privateKey: erc20_wallet.privateKey
    }
}

const sendToken = async (SCAddress,abi, fromAddress, privateKey, toAddress, decimals, value, gasPrice = 30, gasLimit = 80000) => {
    var offest = decimals - 9;
    value = Number(value * 10 ** offest).toFixed(6);
    // console.log("send token")
    // console.log(value);
    let gasPrices = await getCurrentGasPrices();

    try {
        const contract = new web3.eth.Contract(abi, SCAddress);
        console.log(contract.abi)
        const data = contract.methods.transfer(toAddress,web3.utils.toWei(value.toString(), "gwei")).encodeABI();
        privateKey = Buffer.from(privateKey, "hex");
        const txCount = await web3.eth.getTransactionCount(fromAddress, "pending");
        const txObject = {
            nonce: web3.utils.toHex(txCount),
            to: toAddress,
            value: "0x00",
            gasLimit: web3.utils.toHex(gasLimit),
            gasPrice: gasPrices.medium * 1000000000, 
            //gasPrice: web3.utils.toHex(web3.utils.toWei(gasPrice.toString(), "gwei")),
            data: data
        };
        console.log("txObject")
        console.log(txObject)
        // console.log(fromAddress)
        // console.log(privateKey)
        // console.log(toAddress)
        const tx = new Tx(txObject);
        tx.sign(privateKey);
        const serializedTx = tx.serialize();
        const raw = "0x" + serializedTx.toString("hex");
        web3.eth.sendSignedTransaction(raw, (err, txHash) => {
            console.log("err : ", err);
            console.log("txHash : ", txHash);
            return {
                status: 1,
                tx: txHash
            }
        });
    } catch (error) {
        console.log(error);
        return {
            status: 0,
            err: error,
        }
    }
}

const sendUSDT = async (fromAddress, privateKey, toAddress, value, gas_price) => {
    sendToken(USDT_CONTRACT,VARIABLE.ABI_USDT, fromAddress, privateKey.replace("0x", ""), toAddress, 6, value, gas_price);
}

const sendKNC = async (fromAddress, privateKey, toAddress, value, gas_price) => {
    sendToken(KNC_CONTRACT, VARIABLE.ABI_KNC, fromAddress, privateKey.replace("0x", ""), toAddress, 18, value, gas_price);
}

const sendMCH = async (fromAddress, privateKey, toAddress, value, gas_price) => {
    sendToken(MCH_CONTRACT, VARIABLE.ABI_MCH ,fromAddress, privateKey.replace("0x", ""), toAddress, 8, value, gas_price);
}

const sendUSDTToRoot = async(fromAddress, privateKey, value) => {
    // get address and gas_price from db
    var wallet_recei = (await sqlPromise("select erc20_address_receiver from admin_info order by id desc"))[0];
    var gas_price = (await sqlPromise("SELECT field_value FROM `more_info` WHERE field_name='estimate_eth_fees'"))[0].field_value;
    var fees = gas_price * 21000/1e9;
    sendUSDT(fromAddress, privateKey, wallet_recei.erc20_address_receiver, value.toFixed(4), gas_price);
}

const sendETH = async ( fromAddress, privateKey, toAddress, value = FEE_ERC20, gasPrice = 30,gasLimit = 21000) => {
    privateKey = Buffer.from(privateKey, "hex");
    let gasPrices = await getCurrentGasPrices()
    console.log("gas price:", gasPrices)

    try {
        const txCount = await web3.eth.getTransactionCount(fromAddress, "pending");
        const txObject = {
          nonce: web3.utils.toHex(txCount),
          to: toAddress,
          value: web3.utils.toHex(web3.utils.toWei(value.toString(), "ether")),
          gasLimit: web3.utils.toHex(gasLimit),
          gasPrice: gasPrices.medium * 1000000000, //web3.utils.toHex(web3.utils.toWei(gasPrice.toString(), "gwei"))
        };
        const tx = new Tx(txObject);
        tx.sign(privateKey);
        const serializedTx = tx.serialize();
        const raw = "0x" + serializedTx.toString("hex");
        var txHash = await web3.eth.sendSignedTransaction(raw, (err, txHash) => {
            console.log("err : ", err);
            console.log("txHash : ", txHash);
            return {
                status: 1,
                tx: txHash
            }
        });
    } catch (error) {
        return {
            status: 0,
            err: error,
        };
    }
};

const getCurrentGasPrices = async () => {
    let response = await axios.get('https://ethgasstation.info/json/ethgasAPI.json')
    let prices = {
      low: response.data.safeLow / 10,
      medium: response.data.average / 10,
      high: response.data.fast / 10
    }
   
    return prices
}

const sendETHFee = async(toAddress) => {
    // get_erc_20_wallet, erc20_address from db
    var wallet_fee = (await sqlPromise("select erc20_private_send, erc20_address_send from admin_info order by id desc"))[0];
    sendETH(wallet_fee.erc20_address_send, wallet_fee.erc20_private_send.replace("0x", ""), toAddress);
};

const sendETHToRoot = async(privateKey, address, amount) => {
    // get erc_20_address and gas_price from admin
    var wallet_recei = (await sqlPromise("select erc20_address_receiver from admin_info order by id desc"))[0];
    var gas_price = (await sqlPromise("SELECT field_value FROM `more_info` WHERE field_name='estimate_eth_fees'"))[0].field_value;
    var fees = gas_price * 21000/1e9;
    sendETH(address, privateKey.replace("0x", ""), wallet_recei.erc20_address_receiver,( amount - fees).toFixed(6), gas_price);
}

const getBalanceETH = async (address) => {
    return {
      eth: await web3.eth.getBalance(address),
      //usdt: await getBalanceUSDT(USDT_CONTRACT, address)
    }
}

const getBalanceUSDT = async(address)=>{
    // const abi = showABI();
    const contract = new web3.eth.Contract(VARIABLE.ABI_USDT, USDT_CONTRACT);
    const balance =  await contract.methods.balanceOf(address).call();

    return {
        usdt: Number(balance)
    }
}

const getBalanceKNC = async(address)=>{
    // const abi = showABI();
    const contract = new web3.eth.Contract(VARIABLE.ABI_KNC, KNC_CONTRACT);
    const balance =  await contract.methods.balanceOf(address).call();

    return {
        knc: Number(balance)
    }
}

const getBalanceMCH = async(address)=>{
    // const abi = showABI();
    const contract = new web3.eth.Contract(VARIABLE.ABI_MCH, MCH_CONTRACT);
    const balance =  await contract.methods.balanceOf(address).call();

    return {
        mch: Number(balance)
    }
}

module.exports = {
    createERCWallet: createERCWallet,
    sendETH: sendETH,
    sendUSDT: sendUSDT,
    sendUSDTToRoot: sendUSDTToRoot,
    sendETHToRoot: sendETHToRoot,
    sendETHFee: sendETHFee,
    sendKNC: sendKNC,
    sendMCH: sendMCH,
    getBalanceETH: getBalanceETH,
    getBalanceUSDT: getBalanceUSDT,
    getBalanceKNC: getBalanceKNC,
    getBalanceMCH: getBalanceMCH,
   // getBalanceETHandUSDT: getBalanceETHandUSDT
}
