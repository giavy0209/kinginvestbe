const {Types} = require('mongoose')
const twoFactor = require('node-2fa');

const VARIABLE = require('../variable')
const User = require(VARIABLE.MODELS_DIR + '/Users')
const Invest = require(VARIABLE.MODELS_DIR + '/Invests')
const Transaction = require(VARIABLE.MODELS_DIR + '/Transactions')
const Balances = require(VARIABLE.MODELS_DIR + '/Balances')
const Wallets = require(VARIABLE.MODELS_DIR + '/Wallets')
const response_express = require(VARIABLE.LIBS_DIR + '/responses').response_express
const Auth = require(VARIABLE.AUTH_DIR + '/auth')
const btc_f = require(VARIABLE.BLC_DIR + '/btc_functions');
const erc_f = require(VARIABLE.BLC_DIR +'/erc20_functions');
const tron_f = require(VARIABLE.BLC_DIR + '/tron_functions');
const tomo_f = require(VARIABLE.BLC_DIR + '/tomo_functions');

const address_owner = 'usdt_erc20'

module.exports = router=>{
    router.post('/deposit',Auth.expressMiddleware, async(req, res)=>{
        const {value, type, addressTranTo}= req.body
        const id  = req.token_info._id

        var find_user = await User.findById(id)
        if(
            !find_user || 
            !find_user.wallets || 
            !find_user.balances || 
            !find_user.wallets.length ||
            find_user.wallets.length  < 4
        ) {
            return response_express.exception(res, 'no user')
        }
        
        if(type === "eth") {
            if(value < 0.001) {
                return response_express.exception(res,'No need to transfer to main walet')
            }
            const wallet = await Wallets.findOne({user:find_user._id, chain:Types.ObjectId('5f8a6538a492ec0834bbc7c4')})
            
            var txId = await erc_f.sendETH(wallet.address, wallet.private_key, VARIABLE.OWNER_ADDRESS_ERC20, value);

            if(txId.status === 1){
                var create_tran = new Transaction({
                    user : find_user._id,
                    value : value,
                    type : 0,
                    from : addressTranTo,
                    to: wallet.address,
                    coin : Types.ObjectId('5f882b3e52badd1984a7f06c'),
                    
                })
    
                await create_tran.save()

                find_user.transactions.push(create_tran._id)

                var current_balance = await Balances.findOne({user:find_user._id, coins:Types.ObjectId('5f882b3e52badd1984a7f06c')})
                current_balance = current_balance + value
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
                return response_express.exception(res,'No need to transfer to main walet')
            }
            const wallet = await Wallets.findOne({user:find_user._id, chain:Types.ObjectId('5f8a65586927ca2d6cfea93a')})
            
            var txId = await tron_f.sendTRX(wallet.private_key, wallet.address, VARIABLE.OWNER_ADDRESS_TRC20, value)

            if(txId.status === 1){
                var create_tran = new Transaction({
                    user : find_user._id,
                    value : value,
                    type : 0,
                    from : addressTranTo,
                    to: wallet.address,
                    coin : Types.ObjectId('5f882b3e52badd1984a7f06d'),
                    
                })
    
                await create_tran.save()

                find_user.transactions.push(create_tran._id)

                var current_balance = await Balances.findOne({user:find_user._id, coins:Types.ObjectId('5f882b3e52badd1984a7f06d')})
                current_balance = current_balance + value
                await current_balance.save()
                return response_express.success(res,current_balance)
            }else{
                return response_express.exception(res, 'fail')
            }
        }
        else if(deposit_type === "kdg") {
            return {
                status : 0,
                msg : 'not available'
            }
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
        }else if(deposit_type === "usdt-trc20") {
            if(value < 0.5) {
                return response_express.exception(res,'No need to transfer to main walet')
            }
            const wallet = await Wallets.findOne({user:find_user._id, chain:Types.ObjectId('5f8a65586927ca2d6cfea93a')})
            
            var txId = await tron_f.sendUSDT(wallet.private_key, VARIABLE.OWNER_ADDRESS_TRC20, value);

            if(txId.status === 1){
                var create_tran = new Transaction({
                    user : find_user._id,
                    value : value,
                    type : 0,
                    from : addressTranTo,
                    to: wallet.address,
                    coin : Types.ObjectId('5f882b3e52badd1984a7f071'),
                })
    
                await create_tran.save()

                find_user.transactions.push(create_tran._id)

                var current_balance = await Balances.findOne({user:find_user._id, coins:Types.ObjectId('5f8a65586927ca2d6cfea93a')})
                current_balance = current_balance + value
                await current_balance.save()
                return response_express.success(res,current_balance)
            }else{
                return response_express.exception(res, 'fail')
            }
        }
        else if(deposit_type === "tomo") {
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
            return response_express.exception(res, 'deposit type empty or wrong')
        }
    })
}