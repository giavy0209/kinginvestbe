const mongoose = require('mongoose');
const VARIABLE  = require('../variable')
const fetch = require("node-fetch");
var tronWeb = require("tronweb");
var twoFactor = require('node-2fa');
const uuid = require('uuid');

const btc_f = require(VARIABLE.BLC_DIR + '/btc_functions');
const erc_f = require(VARIABLE.BLC_DIR +'/erc20_functions');
const tron_f = require(VARIABLE.BLC_DIR + '/tron_functions');
const tomo_f = require(VARIABLE.BLC_DIR + '/tomo_functions');

const response_express = require(VARIABLE.LIBS_DIR + '/responses').response_express

const User = require(VARIABLE.MODELS_DIR + '/Users')
const Wallets = require(VARIABLE.MODELS_DIR + '/Wallets')
const Transaction = require(VARIABLE.MODELS_DIR + '/Transactions')
const Balances = require(VARIABLE.MODELS_DIR + '/Balances')
const Coins = require(VARIABLE.MODELS_DIR + '/Coins')
var Auth = require(VARIABLE.AUTH_DIR + '/auth'); 

const etherscan_api = "R6UWHB51I91M8H1W9A9C9M26UEYPGV392F";
const USDT_CONTRACT = '0xdac17f958d2ee523a2206206994597c13d831ec7';
const KNC_CONTRACT = '0xdd974d5c2e2928dea5f71b9825b8b646686bd200';
const KDG_CONTRACT = 'TYM9eM22SCynRc5YaMxE2PX1kwv7H2rXAu';
const MCH_CONTRACT = '0xa5e262ec733051b14b38901901a82f2684637e78';
const USDT_TRC20_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

// const kdg_recieve_admin = "TR1HanDFLog66dnqMGsgmP8hd1NqzrqQZb";
// const trx_wallet_admin = "TCDTEMx1fmS1T2DPoJLi4UDfAfaXuNkLU5";
// const private_key_admin = "f0dd96df6bc6d8a2eb48ce432bb7824580965c6a7f80e26ff19bd463914918d6";

// const trx_wallet_fee_admin = "TSCzY7xpJCkaPfTPz3htaTbdSFwCn5iGeF";
// const private_key_fee_admin = "8bb832f268308372b1d088261ec0ef44cc6fc5298c54140c53a3e65bdb12514a";

var TRXWALLET = {
    address : 'TZF9VKpQnHxvtxd7QXdHNn9Min3stJE7NN',
    private_key : 'c6c81057ebda17164558ee977cd66289684f588b45b0b8f36ffdcee1a6d69aaa'
}

module.exports = (router) => {
    router.post(`/withdraw`, Auth.expressMiddleware, async (req, res) => {
        const { type, toAddress, value, token } = req.body;
        const id = req.token_info._id

        if(!toAddress || value === 0 || toAddress === '' || !value){
            return response_express.exception(res,'no wallet or value')
        }

        var find_user = await User.findById(id)
        .populate({
            path:'wallets',
            populate: {
                path:'balances'
            }
        })
        if(
            !find_user || 
            !find_user.wallets || 
            !find_user.balances || 
            !find_user.wallets.length ||
            !find_user.balances.length ||
            find_user.wallets.length  < 4||
            find_user.balances.length < 9
        ) {
            return response_express.exception(res, 'no user')
        }

        if(Boolean(find_user.is2FA) === false) {
            return response_express.success(res,'you must on 2FA to transaction')
        }
        const authened = twoFactor.verifyToken(find_user.google_authenticator_secrect_key, token)
        if(authened === null || authened.delta !== 0 ) {
            return response_express.exception(res, 'verify 2fa fail')
        }

        if(find_user.kyc.signal === false){
            return response_express.exception(res, 'you must kyc before withdraw')
        }

        if(type === "btc") {
            // if(find_user.btc_address === null || find_user.btc_address === undefined) {
            //     return res.status(200).send({
            //             status: 100,
            //             msg: "user haven't create btc address",
            //         });
            // }

            // // set so luong rut toi thieu
            // if(value < 0.001) {
            //     return res.status(200).send({
            //         status: 100,
            //         msg: "you must withdraw min 0.001 BTC",
            //     });
            // }

            // let balance = await btc_f.getBalanceBTC(find_user.btc_address);
            // balance = Number(balance.balance.balance)/1e8;

            // if(balance - value > 0.0005) {             
            //     let privateKey = decodeBase64(find_user.btc_private_key);
            //     await btc_f.transferBTC(find_user.btc_address, privateKey, toAddress, value);
            //     await create_user_transaction(find_user._id, find_admin && find_admin._id, find_user._id, "withdraw", value, "Withdraw BTC");

            //     return res.status(200).send({
            //         status: 1,
            //         msg: "success",
            //     });
            // } else {
            //     return res.status(200).send({
            //         status: 0,
            //         msg: "no enought BTC token, have: " + balance + ", transfer: " + value,
            //     });
            // }
            return {
                status : 0,
                msg : 'not available'
            }
        }
        else if(type === "eth") {
            if(value < 0.001) {
                return response_express.exception(res,'you must withdraw min 0.01 ETH')
            }
            const wallet = find_user.wallets.find(o=>o.chain === mongoose.Types.ObjectId('5f8a6538a492ec0834bbc7c4'))
            var find_balance = wallet.balances.find(o => o.coin === mongoose.Types.ObjectId('5f882b3e52badd1984a7f06c'))
            if(find_balance.balance < value + 0.01) {
                return response_express.exception(res,'not enought ETH')
            }
            
            var txId = await erc_f.sendETH(VARIABLE.OWNER_ADDRESS_ERC20, VARIABLE.PRIVATE_KEY_ERC20, toAddress, value);

            if(txId.status === 1){
                var create_tran = new Transaction({
                    user : find_user._id,
                    value : value,
                    type : 1,
                    from : wallet.address,
                    to: toAddress,
                    coin : Types.ObjectId('5f882b3e52badd1984a7f06c'),
                })
    
                await create_tran.save()
    
                find_user.transactions.push(create_tran._id)

                var current_balance = await Balances.findOne({user:find_user._id, coins:Types.ObjectId('5f882b3e52badd1984a7f06c')})
                current_balance = current_balance - value
                await current_balance.save()
                return response_express.success(res,current_balance)
            }else{
                return response_express.exception(res, 'fail')
            }
        }
        else if(type === "usdt") {
            return {
                status : 0,
                msg : 'not available'
            }
            if(find_user !== null) {
                let privateKey = decodeBase64(find_user.erc_private_key);

                // set so luong rut toi thieu
                if(value < 5) {
                    return res.status(200).send({
                        status: 100,
                        msg: "you must withdraw min 5 USDT-ERC20",
                    });
                }

                // check xem có đủ ETH value ko
                let balance_eth = await erc_f.getBalanceETH(find_user.erc_address);
                balance_eth = Number(balance_eth.eth)/1e18;

                if(balance_eth < 0.01) {
                    return res.status(200).send({
                        status: 102,
                        msg: "no enought ETH (fee) to transaction",
                    });
                }

                // check xem có đủ token value ko
                let balance = await erc_f.getBalanceUSDT(find_user.erc_address);
                balance = balance.usdt/1e6;

                if(balance - value > 0) {
                    await erc_f.sendUSDT(find_user.erc_address, privateKey, toAddress, value);

                    // create transaction for withdraw
                    await create_user_transaction(find_user._id, find_admin && find_admin._id, find_user._id, "withdraw", value, "Withdraw USDT");

                    return res.status(200).send({
                        status: 1,
                        msg: "success",
                    });
                } else {
                    return res.status(200).send({
                        status: 0,
                        msg: "no enought USDT token, have: " + balance + ", transfer: " + value,
                    });
                }
            } else {
                return res.status(200).send({
                    status: 0,
                    msg: "no find user",
                });
            }
        }
        else if(type === "knc") {
            return {
                status : 0,
                msg : 'not available'
            }
            if(find_user !== null) {
                let privateKey = decodeBase64(find_user.erc_private_key);

                // set so luong rut toi thieu
                if(value < 1) {
                    return res.status(200).send({
                        status: 100,
                        msg: "you must withdraw min 1 KNC",
                    });
                }

                // check xem có đủ ETH value ko
                let balance_eth = await erc_f.getBalanceETH(find_user.erc_address);
                balance_eth = Number(balance_eth.eth)/1e18;

                if(balance_eth < 0.01) {
                    return res.status(200).send({
                        status: 102,
                        msg: "no enought ETH (fee) to transaction",
                    });
                }

                // check xem có đủ token value ko
                let balance = await erc_f.getBalanceKNC(find_user.erc_address);
                balance = balance.knc/1e18;

                if(balance - value > 0) {
                    await erc_f.sendKNC(find_user.erc_address, privateKey, toAddress, value);

                    // create transaction for withdraw
                    
                    return res.status(200).send({
                        status: 1,
                        msg: "success",
                    });
                } else {
                    return res.status(200).send({
                        status: 0,
                        msg: "no enought KNC token, have: " + balance + ", transfer: " + value,
                    });
                }
            } else {
                return res.status(200).send({
                    status: 0,
                    msg: "no find user",
                });
            }
        }
        else if(type === "mch") {
            return {
                status : 0,
                msg : 'not available'
            }
            if(find_user !== null) {
                let privateKey = decodeBase64(find_user.erc_private_key);

                // set so luong rut toi thieu
                if(value < 5) {
                    return res.status(200).send({
                        status: 100,
                        msg: "you must withdraw min 5 MCH",
                    });
                }

                // check xem có đủ ETH value ko
                let balance_eth = await erc_f.getBalanceETH(find_user.erc_address);
                balance_eth = Number(balance_eth.eth)/1e18;

                if(balance_eth < 0.01) {
                    return res.status(200).send({
                        status: 102,
                        msg: "no enought ETH (fee) to transaction",
                    });
                }

                // check xem có đủ token value ko
                let balance = await erc_f.getBalanceMCH(find_user.erc_address);
                balance = balance.mch/1e8;

                if(balance - value > 0) {
                    await erc_f.sendMCH(find_user.erc_address, privateKey, toAddress, value);

                    // create transaction for withdraw
                    await create_user_transaction(find_user._id, find_admin && find_admin._id, find_user._id, "withdraw", value, "Withdraw MCH");

                    return res.status(200).send({
                        status: 1,
                        msg: "success",
                    });
                } else {
                    return res.status(200).send({
                        status: 0,
                        msg: "no enought MCH token, have: " + balance + ", transfer: " + value,
                    });
                }
            } else {
                return res.status(200).send({
                    status: 0,
                    msg: "no find user",
                });
            }
        }
        
        else if(type === "tron") {
            if(value < 1) {
                return response_express.exception(res,'you must withdraw min 1 trx')
            }
            const wallet = find_user.wallets.find(o=>o.chain === mongoose.Types.ObjectId('5f8a65586927ca2d6cfea93a'))
            var find_balance = wallet.balances.find(o => o.coin === mongoose.Types.ObjectId('5f882b3e52badd1984a7f06d'))
            if(find_balance.balance < value + 1) {
                return response_express.exception(res,'not enought TRX')
            }
            
            var txId = await tron_f.sendTRX(VARIABLE.PRIVATE_KEY_TRC20, VARIABLE.OWNER_ADDRESS_TRC20, toAddress, value);

            if(txId.status === 1){
                var create_tran = new Transaction({
                    user : find_user._id,
                    value : value,
                    type : 1,
                    from : wallet.address,
                    to: toAddress,
                    coin : Types.ObjectId('5f882b3e52badd1984a7f06d'),
                })
    
                await create_tran.save()
    
                find_user.transactions.push(create_tran._id)

                var current_balance = await Balances.findOne({user:find_user._id, coins:Types.ObjectId('5f882b3e52badd1984a7f06d')})
                current_balance = current_balance - value
                await current_balance.save()
                return response_express.success(res,current_balance)
            }else{
                return response_express.exception(res, 'fail')
            }
        }
        else if(type === "kdg") {
            var find_coin = find_user.balances.find(o => o.coin.code === 'KDG')
            var find_balance = find_coin.balance

            if(find_balance < value + 1) {
                return res.send({
                    status : 0,
                    msg : 'not enought KDG'
                })
            }
            
            var txId = await tron_f.sendKDG(TRXWALLET.private_key, toAddress, value);

            var create_tran = new BlockchainTransaction({
                user : find_user._id,
                wallets : find_user.wallets._id,
                coin : find_coin.coin._id,
                create_date : new Date(),
                from : find_user.wallets.find(o => o.chain.name === 'TRC20').address,
                to : toAddress,
                value : value,
                type : 0,
                txId
            })

            await create_tran.save()

            var find_current_balance_of_coin = await Balances.findOne({user : find_user._id , coin :find_coin.coin._id})
            find_current_balance_of_coin.balance = find_current_balance_of_coin.balance - value - 1
            await find_current_balance_of_coin.save()

            return res.status(200).send({
                status: 1,
            });
        }else if(type === "usdt-trc20") {
            var find_coin = find_user.balances.find(o => o.coin.code === 'USDT')
            var find_balance = find_coin.balance

            if(find_balance < value + 0.5) {
                return res.send({
                    status : 0,
                    msg : 'not enought USDT'
                })
            }
            
            var txId = await tron_f.sendUSDT(TRXWALLET.private_key, toAddress, value);

            var create_tran = new BlockchainTransaction({
                user : find_user._id,
                wallets : find_user.wallets._id,
                coin : find_coin.coin._id,
                create_date : new Date(),
                from : find_user.wallets.find(o => o.chain.name === 'TRC20').address,
                to : toAddress,
                value : value,
                type : 0,
                txId
            })

            await create_tran.save()

            var find_current_balance_of_coin = await Balances.findOne({user : find_user._id , coin :find_coin.coin._id})
            find_current_balance_of_coin.balance = find_current_balance_of_coin.balance - value - 0.5
            await find_current_balance_of_coin.save()

            return res.status(200).send({
                status: 1,
            });
        }
        else if(type === "tomo") {
            return {
                status : 0,
                msg : 'not available'
            }
            if(find_user !== null) {
                let privateKey = decodeBase64(find_user.tomo_private_key);
                // set so luong rut toi thieu
                if(value < 1) {
                    return res.status(200).send({
                        status: 100,
                        msg: "you must withdraw min 1 TOMO",
                    });
                }

                // check xem có đủ TOMO value ko
                let balance_tomo = await tomo_f.getBalanceTOMO(find_user.tomo_address);
                balance_tomo = Number(balance_tomo.tomo)/1e18;

                if(balance_tomo - value > 0.1) {
                    await tomo_f.sendTOMO(privateKey, toAddress, value);

                    // create transaction for withdraw
                    await create_user_transaction(find_user._id, find_admin && find_admin._id, find_user._id, "withdraw", value, "Withdraw TOMO");

                    return res.status(200).send({
                        status: 1,
                        msg: "success",
                    });
                } else {
                    return res.status(200).send({
                        status: 0,
                        msg: "no enought TOMO token, have: " + balance_tomo + ", transfer: " + value,
                    });
                }
            } else {
                return res.status(200).send({
                    status: 0,
                    msg: "no find user",
                });
            }
        }
        
        else {
            return res.status(200).send({
                status: 1,
                msg: "deposit type empty or wrong",
            });
        }
    });
 
//     router.get(`/blockchain_transaction`, auth_controller.isAuthenticated, async (req, res) => {
//         const { coin_type, address, begin_date, take, skip } = req.query;
//         try
//         {
//             if(coin_type === "btc") {

//                 var link = "https://blockchain.info/rawaddr/" + address; //+ "?skip=" + skip + "&limit=" + take;
//                 var data_2 = await fetch(link);
//                 var data = await data_2.json();
//                 return res.status(200).send({
//                                             status: 1,
//                                             data: data,
//                                         });
//             }
//             else if(coin_type === "eth") {
//                 var link = "https://api.etherscan.io/api?module=account&action=txlist&apikey=" + etherscan_api 
//                          + "&address=" + address + "&startblock=" + "0" + "&endblock=99999999&sort=desc&offset=" + take + "&page=" + skip;
//                 var data = await fetch(link);
//                 data = await data.json();
                
//                 return res.status(200).send({
//                                             status: 1,
//                                             data: data,
//                                         });
//             }
//             else if(coin_type === "usdt") {
//                 var link = "https://api.etherscan.io/api?module=account&action=tokentx&apikey=" + etherscan_api 
//                          + "&contractaddress=" + USDT_CONTRACT          
//                          + "&address=" + address + "&startblock=" + "0" + "&endblock=99999999&sort=desc&offset=" + take + "&page=" + skip;
//                 var data = await fetch(link);
//                 data = await data.json();
                
//                 return res.status(200).send({
//                                             status: 1,
//                                             data: data,
//                                         });
//             }
//             else if(coin_type === "knc") {
//                 var link = "https://api.etherscan.io/api?module=account&action=tokentx&apikey=" + etherscan_api 
//                          + "&contractaddress=" + KNC_CONTRACT          
//                          + "&address=" + address + "&startblock=" + "0" + "&endblock=99999999&sort=desc&offset=" + take + "&page=" + skip;
//                 var data = await fetch(link);
//                 data = await data.json();
                
//                 return res.status(200).send({
//                                             status: 1,
//                                             data: data,
//                                         });
//             }
//              else if(coin_type === "mch") {
//                 var link = "https://api.etherscan.io/api?module=account&action=tokentx&apikey=" + etherscan_api 
//                          + "&contractaddress=" + MCH_CONTRACT          
//                          + "&address=" + address + "&startblock=" + "0" + "&endblock=99999999&sort=desc&offset=" + take + "&page=" + skip;
//                 var data = await fetch(link);
//                 data = await data.json();
                
//                 return res.status(200).send({
//                                             status: 1,
//                                             data: data,
//                                         });
//             }
//             else if(coin_type === "tron") {
//                 // begin_date = "yyyy-mm-dd"
//                 var date_to_unix = new moment(begin_date).valueOf(); //; moment(new Date()).valueOf();
//                 var link = "https://apilist.tronscan.org/api/transfer?sort=-timestamp&count=true&limit=" + take + "&start=" + skip + "&token=_&address=" + address;
//                 // var link = "https://api.trongrid.io/v1/accounts/" + address 
//                 //         + "/transactions?order_by=block_timestamp,desc&limit=" + take +"&only_to=true&only_confirmed=true&min_timestamp=" + date_to_unix;
//                 var data = await fetch(link);
//                 data = await data.json();
                
//                 return res.status(200).send({
//                                             status: 1,
//                                             data: data,
//                                         });
//             }
//             else if(coin_type === "kdg") {
//                 var date_to_unix = new moment(begin_date).valueOf(); //; moment(new Date()).valueOf();
//                 var link = "https://apilist.tronscan.org/api/contract/events?address=" 
//                         + address + "&limit=" + take + "&start_timestamp=" + date_to_unix + "&contract=" + KDG_CONTRACT;
//                 var data = await fetch(link);
//                 data = await data.json();
                
//                 return res.status(200).send({
//                                             status: 1,
//                                             data: data,
//                                         });
//             }
//             else if(coin_type === "tomo") {
//                 var link = "https://scan.tomochain.com/api/txs/listByAccount/" + address + "?skip=" + skip + "&limit=" + take;
//                 var data = await fetch(link);
//                 data = await data.json();
                
//                 return res.status(200).send({
//                                             status: 1,
//                                             data: data,
//                                         });
//             }
//              else if(coin_type === "usdt-trc20") {
//                 var date_to_unix = new moment(begin_date).valueOf(); //; moment(new Date()).valueOf();
//                 var link = "https://apilist.tronscan.org/api/contract/events?address=" 
//                         + address + "&limit=" + take + "&start_timestamp=" + date_to_unix + "&contract=" + USDT_TRC20_CONTRACT;
//                 var data = await fetch(link);
//                 data = await data.json();
                
//                 return res.status(200).send({
//                                             status: 1,
//                                             data: data,
//                                         });
//             }
//             else {
//                 return res.status(200).send({
//                     status: 1,
//                     err: "wrong coin type",
//                 });
//             }
//         }
//         catch(er){
//             return res.status(200).send({
//                                         status: 0,
//                                         err: er,
//                                     });
//         }
//     });
// //
//     router.post(`/convert_kdg_reward`, auth_controller.isAuthenticated, async (req, res) => {
//         const { userId, value } = req.body;
//         // Tru KDG Reward cho admin
//         var findUser = await User.findOne({ _id : userId });
    
//         if(findUser) {
//             var now_date = new moment();
//             let limitDate = new moment("2020-09-01");
//             let sub_days = moment.duration(moment(findUser.create_date).diff(limitDate)).days();
//             let isNewUser = sub_days > 0 ? true : false;
//             if(findUser.kdg_reward < value * 2) {
//                 return res.status(200).send({
//                     status: 100,
//                     err: "you can enough kdg reward to convert"
//                 });
//             }

//             // Kiem tra so luong doi
//             if(isNewUser === false) {
//                 if(value > 10) {
//                     return res.status(200).send({
//                         status: 101,
//                         err: "you only can convert max 20 KDG Reward on 1 day"
//                     });
//                 }
//             }
//             else {
//                 if(value > 25) {
//                     return res.status(200).send({
//                         status: 102,
//                         err: "you only can convert max 50 KDG Reward on 1 day"
//                     });
//                 }

//                 if(value < 12.5) {
//                     return res.status(200).send({
//                         status: 104,
//                         err: "you must convert min 25 KDG Reward"
//                     });
//                 }
//             }

//             if(findUser.convert_kdg_reward_date !== undefined) {
//                 var diff_days = now_date.diff(findUser.convert_kdg_reward_date, 'days'); // moment().subtract(findUser.convert_kdg_reward_date).months();

//                 if(diff_days <= 0) {
//                     return res.status(200).send({
//                         status: 103,
//                         err: "today you converted kdg reward! Please wait for next day"
//                     });
//                 }
//             }

//             var update_kdg_reward = findUser.kdg_reward - value * 2;
    
//             // Them bang dung so luong do vao vi Admin
//             let result1 = await update_kdg_reward_of_admin(value * 2);

//             if(result1.status === 1) {
//                 let result2 = await User.findByIdAndUpdate(findUser._id, {
//                     kdg_reward: update_kdg_reward,
//                     convert_kdg_reward_date: new Date(),
//                 });

//                 var coin = await Coins.findOne({code : 'KDG'})

//                 var balance = await Balances.findOne({user : findUser._id, coin : coin._id})
//                 balance.balance = balance.balance + value
//                 await balance.save()
//                 let find_admin = await User.findOne({ email: 'admin' });

//                 let trans = await create_user_transaction(findUser._id, find_admin && find_admin._id, findUser._id, "convert_kdg_reward", value, "Convert KDG Reward");

//                 await findUser.save()
//                 return res.status(200).send({
//                     status: 1,
//                     msg: 'convert kdg reward success',
//                 });
//             } else {
//                 return res.status(200).send({
//                     status: 0,
//                     err: 'no find admin'
//                 });
//             }
//         }          
//     });
// //
//     router.post(`/convert_kdg`, auth_controller.isAuthenticated, async (req, res) => {
//         const { userId, value } = req.body;

//         // Tru KDG Reward cho admin
//         var findUser = await User.findOne({ _id : userId });
    
//         if(findUser) {
//             var coin = await Coins.findOne({code : 'KDG'})
//             var balance = await Balances.findOne({user : findUser._id, coin : coin._id})
            

//             if(balance.balance < value) {
//                 return res.status(200).send({
//                     status: 100,
//                     msg: 'you only have ' + balance.balance + ' KDG, cannot convert to ' + value,
//                 });
//             }

//             if(value < 2 || value > 200){
//                 return res.send({
//                     status : 100,
//                     msg : 'min = 2kdg,max = 200kdg'
//                 })
//             }

//             var dateToday = new Date()
//             var d = dateToday.getDate()
//             var m = dateToday.getMonth() + 1
//             var y = dateToday.getFullYear()

//             var dateNextDay = new Date(dateToday.getTime() + 86400000)
//             var dnext = dateNextDay.getDate()
//             var mnext = dateNextDay.getMonth() + 1
//             var ynext = dateNextDay.getFullYear()



//             var countTransaction = await UserTransaction.countDocuments(
//                 {
//                     $and : [
//                         {
//                             type : 'convert_kdg'
//                         },
//                         {
//                             userId : userId
//                         },
//                         {
//                             create_date : {$gte : new Date(`${y}-${m}-${d}`)}
//                         },
//                         {
//                             create_date : {$lt : new Date(`${ynext}-${mnext}-${dnext}`)}
//                         }
//                     ]
//                 }
//             )

//             if(countTransaction >= 5){
//                 return res.send({
//                     status : 101,
//                     msg : 'limit 5 / day'
//                 })
//             }
            

//             var update_kdg_reward = parseFloat(findUser.kdg_reward) + parseFloat(value * 2);
    
//             let result1 = await update_kdg_reward_of_admin(-value * 2);

//             if(result1.status === 1) {
//                 let result2 = await User.findByIdAndUpdate(findUser._id, {
//                     kdg_reward: update_kdg_reward
//                 });

//                 balance.balance = balance.balance - value
//                 await balance.save()

//                 let find_admin = await User.findOne({ email: 'admin' });

//                 let trans = await create_user_transaction(findUser._id, findUser._id, find_admin && find_admin._id,  "convert_kdg", value, "Convert KDG");

//                 return res.status(200).send({
//                     status: 1,
//                     msg: 'convert kdg success',
//                 });
//             } else {
//                 return res.status(200).send({
//                     status: 0,
//                     err: 'no find admin'
//                 });
//             }
//         } else {
//             return res.status(200).send({
//                 status: 0,
//                 err: 'no find user'
//             });
//         }        
//     });

//     function encodeBase64(data) {
//         let buff = new Buffer(data);
//         let base64data = buff.toString('base64');
//         return base64data;
//     }

//     function decodeBase64(base64data) {
//         let buff_decode = Buffer.from(base64data, 'base64');
//         let text = buff_decode.toString('ascii');
//         return text;
//     }

//     update_kdg_reward_of_admin = async(value) => {
//         let find_admin = await User.findOne({ email: 'admin' });
//          if(find_admin !== null) {
//              let current_kdg_reward_admin = find_admin.kdg_reward;
//              let new_kdg_reward_admin = current_kdg_reward_admin + value;
     
//              await User.findByIdAndUpdate(find_admin._id, {
//                  kdg_reward: new_kdg_reward_admin,
//              });
             
//              return {
//                  status: 1,
//                  msg: "success",
//              }
//          }
//          else {
//              return {
//                  status: 0,
//                  err: 'no find admin'
//              }
//          }
//     }

    
//     create_user_transaction = async (_userId, _from, _to, _type, _value, _note) => {
//         var new_doc = {
//             userId: _userId,
//             from: _from,
//             to: _to,
//             type: _type,
//             value: _value,
//             note: _note,
//             txId: uuid.v4(),
//             create_date: new Date(),
//         }

//         let new_transaction = await UserTransaction.create(new_doc);

//         return {
//             status: 1,
//             data: new_transaction
//         };
//     }
}