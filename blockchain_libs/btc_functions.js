const bitcoin = require("bitcoinjs-lib")
const fetch = require("node-fetch");
var cs = require('coinstring')
const TOKEN = "38529529e38f4816892d512b653d4a3a";
// var keys    = bitcoin.ECPair(bigi.fromHex("ea0fd1cffb3575b0fbd22e32593bce16402ccd396ed0640f27529c770eaa3cd2"));
// const { URLSearchParams } = require('url');
module.exports = {
    createBTCWallet: function() {
        // const network = bitcoin.networks.testnet;
        // console.log(network)
        // const keypair = bitcoin.ECPair.makeRandom({ network });
        // console.log("keypair")
        // console.log(keypair)
        // const pubkey = keypair.publicKey;
        // const addressObject = bitcoin.payments.p2pkh({ pubkey, network })
        // console.log("address:", addressObject.address)
        // return {
        //     network: network,
        // }
        const keyPair = bitcoin.ECPair.makeRandom();
        const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
        const publicKey = keyPair.publicKey.toString("hex");
        const privateKey = keyPair.toWIF();
        return { address, privateKey, publicKey };

        // testnet address: mr51tAu9TALyvygHRJxdXxVLFyy7LdMR67
        // 0.0027061 btc

        // to btc address
        // mgDZpmuaQ3ZwhAATBrEBfQdCqbD7xuVNnC
    },

    transferBTC: async(from_address, private_key, to_address, value) => {
        console.log("transferBTC")
        value = value*1e8;

        var newtx = {
            inputs: [{addresses: [from_address]}],
            outputs: [{addresses: [to_address], value: value}]
        };

        var res = cs.decode(private_key)
        var res_hex = res.toString('hex');
        var private_key_toHex = res_hex.substring(2, res_hex.length - 2);
        const keys = bitcoin.ECPair.fromPrivateKey(Buffer.from(private_key_toHex, 'hex'));
      //  var first_encode = base58.b58decode('L1ZEwbxuu3cED1dECYjJyupmQtxAF2K3HUdotFUdM1WRkc1agc1Q')
      //  var private_key_full = binascii.hexlify(first_encode)
        
        //let obj = wif.decode("L1ZEwbxuu3cED1dECYjJyupmQtxAF2K3HUdotFUdM1WRkc1agc1Q", 0x80);

        console.log("res", res.toString('hex'))
        console.log("private_key_toHex", private_key_toHex)
        console.log("value", value)
      //  console.log("version", res.version.toString('hex')) // => 80
      //  console.log("payload", res.payload.toString('hex'))

        //console.log("first_encode", obj)
        //console.log("private_key_full", private_key_full)
        // return {
        //     status: 1,
        // }
        var url = 'https://api.blockcypher.com/v1/btc/main/txs/new?token='+TOKEN;
        fetch(url, { method: 'POST', 
                     body: JSON.stringify(newtx), 
                      headers: { 'Content-Type': 'application/json' },
                 })
          .then(res => res.json())
          .then(tmptx => {
            console.log("tmptx", tmptx)
                tmptx.pubkeys = [];
                tmptx.signatures = tmptx.tosign.map(function(tosign, n) {
                  tmptx.pubkeys.push(keys.publicKey.toString("hex"));
                  //return keys.sign(new buffer.Buffer(tosign, "hex")).toString("hex");
                    const SIGHASH_ALL = 0x01;

                    return bitcoin.script.signature.encode(
                        keys.sign(Buffer.from(tosign, "hex")),
                        0x01,
                    ).toString("hex").slice(0, -2);
                });
                console.log("tmptx", tmptx)

                fetch('https://api.blockcypher.com/v1/btc/main/txs/send', { method: 'POST', 
                    body: JSON.stringify(tmptx), 
                    headers: { 'Content-Type': 'application/json' },
                 })
                .then(res => res.json())
                .then(finaltx => console.log("finaltx", finaltx))
           });
    },

    getBalanceBTC: async(address) => {
        var link = 'https://api.blockcypher.com/v1/btc/main/addrs/' + address + '/balance';
       // var link2 = 'https://api.blockcypher.com/v1/btc/main/addrs/1N9j4PNNjUGuk3vw1HATVsQyhyTAHBVWz6/full?before=300000';
        var data = await fetch(link);
        data = await data.json();
        return {
            balance: data
        }
    }
}

// {
//     "status": 1,
//     "coin_type": "btc",
//     "btc_wallet": {
//         "address": "1NkeNDiG5WW3vyaXkFz1FjiurDZAQeHLow",
//         "privateKey": "L1ZEwbxuu3cED1dECYjJyupmQtxAF2K3HUdotFUdM1WRkc1agc1Q",
//         "publicKey": "021bfb01772214f819e1e5a6de25eb41b070e51f95dffefecda2fdcc21351970bb"
//     },
//     "erc_wallet": {},
//     "trx_wallet": {},
//     "tomo_wallet": {}
// }