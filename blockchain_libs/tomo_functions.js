const Web3 = require('web3');
const PrivateKeyProvider = require('truffle-privatekey-provider')
const provider = new Web3.providers.HttpProvider('https://rpc.tomochain.com')
const web3 = new Web3('https://rpc.tomochain.com');

//const web3_provider = new Web3(provider)

const createTOMOWallet = async () => {
    var tomo_wallet = await web3.eth.accounts.create();
    return {
        address: tomo_wallet.address,
        privateKey: tomo_wallet.privateKey
    }
}

const sendTOMO = async(privateKey, toAddress, value) => {
    try
    {
        let pk = privateKey
        let provider = await new PrivateKeyProvider(pk, 'https://rpc.tomochain.com')
        let web3_provider = await new Web3(provider)
        let coinbase = await web3_provider.eth.getCoinbase()
        web3_provider.eth.sendTransaction({
            from: coinbase,
            to: toAddress,
            value: value*1e18
        })
        .then(function (receipt) {
            //console.log("receipt", receipt)
            return {
                status: 1,
                tx: receipt
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

const getBalanceTOMO = async (address) => {
    return {
      tomo: await web3.eth.getBalance(address),
    }
}

// getBalanceTOMO('0xf8fAe46d251d12529410563069E4f96bCe2CB37c').then((res)=>{
//     console.log(res);
// })

module.exports = {
    createTOMOWallet: createTOMOWallet,
    getBalanceTOMO: getBalanceTOMO,
    sendTOMO: sendTOMO,
}