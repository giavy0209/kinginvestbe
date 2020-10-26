const TronWeb = require('tronweb')
const HttpProvider = TronWeb.providers.HttpProvider; // This provider is optional, you can just use a url for the nodes instead
const fullNode = new HttpProvider('https://api.trongrid.io'); // Full node http endpoint
const solidityNode = new HttpProvider('https://api.trongrid.io'); // Solidity node http endpoint
const eventServer = 'https://api.trongrid.io/'; // Contract events http endpoint

const privateKey = 'da146374a75310b9666e834ee4ad0866d6f4035967bfc76217c5a495fff9f0d0';

var conn = "";

const Web3 = require('web3');
const Link_api = 'https://mainnet.infura.io/v3/73707007b7d74be6a1168fff361ee670';
const web3 = new Web3(Link_api);

const tronWeb = new TronWeb(
    fullNode,
    solidityNode,
    eventServer,
    privateKey
);
const TRX_FEE = 1000000;
const KDG_CONTRACT = 'TYM9eM22SCynRc5YaMxE2PX1kwv7H2rXAu';
const USDT_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

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

const sendTRX = async(private, fromAdd, toAdd, amount) => {
  // try
  // {
    //var privateKey = private;
    var fromAddress = fromAdd;
    var toAddress = toAdd;
    amount = amount * 1e6;
    console.log(private+ "," + fromAddress + "," + toAddress + "," + amount)
    var tradeobj = await tronWeb.transactionBuilder.sendTrx(
      toAddress,
      Math.floor(amount), //- TRX_FEE),
      fromAddress
    );
    const signedtxn = await tronWeb.trx.sign(
      tradeobj,
      private
    );
    const receipt = await tronWeb.trx.sendRawTransaction(
      signedtxn
    ).then(output => {
      console.log('- Output:', output, '\n');
      return {
        status: 1,
        txid: output.txid,
      };
    });
  // }
  // catch(er){
  //     return {
  //         status: 0,
  //         err: er,
  //     };
  // }
}

const sendKDG = async(private, toAdd, amount) => {
  try
  {
    var new_tronWeb = new TronWeb(
      fullNode,
      solidityNode,
      eventServer,
      private
    );
    let contract = await new_tronWeb.contract().at(KDG_CONTRACT);
    // var trx_receiver = (await sqlPromise("select trx_address_receiver from admin_info order by id desc"))[0].trx_address_receiver;
  let xx =  await contract.transfer(toAdd, web3.utils.toWei((amount * 10 ** 9).toString(), "gwei"))
                  .send({feeLimit : TRX_FEE}).then(
                      output => {console.log('- Output:', output, '\n');
                      return {
                        status: 1,
                        output: output,
                      };
                    });

    return {
      status: 1,
      data: xx,
    };
  }
  catch(er){
      return {
          status: 0,
          err: er,
      };
  }
}

const sendUSDT = async(private, toAdd, amount) => {
  try
  {
    var new_tronWeb = new TronWeb(
      fullNode,
      solidityNode,
      eventServer,
      private
    );
    let contract = await new_tronWeb.contract().at(USDT_CONTRACT);
    // var trx_receiver = (await sqlPromise("select trx_address_receiver from admin_info order by id desc"))[0].trx_address_receiver;
    let xx =  await contract.transfer(toAdd, web3.utils.toWei(((amount * 10 ** 9)/1e12).toString(), "gwei"))
                  .send({feeLimit : TRX_FEE}).then(
                      output => {console.log('- Output:', output, '\n');
                      return {
                        status: 1,
                        output: output,
                      };
                    });

    return {
      status: 1,
      data: xx,
    };
  }
  catch(er){
      return {
          status: 0,
          err: er,
      };
  }
}



module.exports = {
    createTRXWallet: async function (){
        var wallet = await tronWeb.createAccount();
        return {
          address: wallet.address.base58,
          privateKey: wallet.privateKey
        }
    },
    getBalanceTRX: async function (address){
        return {
          trx: await tronWeb.trx.getBalance(address),
        }
    },
    getBalanceKDG: async function (scAddress, address){
        let contract = await tronWeb.contract().at(scAddress);
        return {
          kdg: await contract.balanceOf(address).call()
        }
    },
     getBalanceUSDT: async function (scAddress, address){
        let contract = await tronWeb.contract().at(scAddress);
        return {
          usdt: await contract.balanceOf(address).call()
        }
    },
    getBalanceTRXAndTRC20: async function (scAddress, address){
        let contract = await tronWeb.contract().at(scAddress);
        return {
          trx: await tronWeb.trx.getBalance(address),
          trc20: await contract.balanceOf(address).call()
        }
    },
    sendTRX: sendTRX,
    sendTRXToRoot : async function (privateKey, fromAddress, amount ){
        // get trx_address admin
        var trx_receiver = (await sqlPromise("select trx_address_receiver from admin_info order by id desc"))[0].trx_address_receiver;
        var tradeobj = await tronWeb.transactionBuilder.sendTrx(
          trx_receiver,
          Math.floor(amount - TRX_FEE),
          fromAddress
        );
        const signedtxn = await tronWeb.trx.sign(
          tradeobj,
          privateKey
        );
        const receipt = await tronWeb.trx.sendRawTransaction(
          signedtxn
        ).then(output => {});
    },
    sendTRXFEE : async function (address){
        var wallet_fee = (await sqlPromise("select trx_private_send, trx_address_send from admin_info order by id desc"))[0];
        var tradeobj = await tronWeb.transactionBuilder.sendTrx(
          address,
          TRX_FEE,
          wallet_fee.trx_address_send
        );
        const signedtxn = await tronWeb.trx.sign(
          tradeobj,
          wallet_fee.trx_private_send
        );
        const receipt = await tronWeb.trx.sendRawTransaction(
          signedtxn
        ).then(output => {console.log('- Output:', output, '\n');});
    },
    sendKDG: sendKDG,
    sendUSDT: sendUSDT,
    // sendKDGToRoot : async function(privateKey, admin_wallet, amount){
    //   // var new_tronWeb = new TronWeb(
    //   //     fullNode,
    //   //     solidityNode,
    //   //     eventServer,
    //   //     privateKey
    //   // );
    //   // let contract = await new_tronWeb.contract().at(KDG_CONTRACT);
    //   var trx_receiver = (await sqlPromise("select trx_address_receiver from admin_info order by id desc"))[0].trx_address_receiver;
    //   // await contract.transfer(trx_receiver, web3.utils.toWei((amount * 10 ** 9).toString(), "gwei")).send({feeLimit : TRX_FEE}).then(output => {console.log('- Output:', output, '\n');});
    //   sendKDG(privateKey, trx_receiver, amount);
    // },
    tronWeb:tronWeb
}


const a = async function(scAddress, address){
  let contract = await tronWeb.contract().at(scAddress);
  return {
    kdg: await contract.balanceOf(address).call()
  }
}

a('TYM9eM22SCynRc5YaMxE2PX1kwv7H2rXAu','TFg2eWsa86U4x4wRzaSLyWBXtmwUApauGm').then((res)=>{
  console.log(Number(res.kdg));
})

function selectionSort(inputArr) { 
  let n = inputArr.length;
      
  for(let i = 0; i < n; i++) {
      // Finding the smallest number in the subarray
      let min = i;
      for(let j = 0; j < n; j++){
          if(inputArr[j] < inputArr[min]) {
              min=j; 
          }
       }
       if (min != i) {
           // Swapping the elements
           let tmp = inputArr[i]; 
           inputArr[i] = inputArr[min];
           inputArr[min] = tmp;      
      }
  }
  return inputArr;
}