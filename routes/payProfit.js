const {Types} = require('mongoose')
const { _transfer, isMaxProfit, checkActivateDate, checkMissParams} = require('../libs/commons')
const { populate } = require('../models/Users')

const VARIABLE = require('../variable')
const depositRoutes = require('./depositRoutes')
const User = require(VARIABLE.MODELS_DIR + '/Users')
const Invest = require(VARIABLE.MODELS_DIR + '/Invests')
const Balances = require(VARIABLE.MODELS_DIR + '/Balances')
const Wallets = require(VARIABLE.MODELS_DIR + '/Wallets')
const Transaction = require(VARIABLE.MODELS_DIR + '/Transactions')
const response_express = require(VARIABLE.LIBS_DIR + '/responses').response_express
const Auth = require(VARIABLE.AUTH_DIR + '/auth')


module.exports = router =>{
    router.post('/pay_profit',Auth.expressMiddleware,async (req, res)=>{
        try{
            const {value, coin} = req.body  
            const idSender = req.token_info._id
            const idReceiver = req.query.id
            var addressFrom
            var addressTo
            var coins
            const sender = await User.findById(idSender)
            const receiver = await User.findById(idReceiver)
            if(coin === 'eth'){
                const balanceSender = await Balances.findOne({user:idSender, coins:Types.ObjectId('5fa8ac7b2c89c5229459f9fc')})
                console.log(balanceSender ,'Hwekekekkkllkk');
                const walletSender = await Wallets.findById(balanceSender.wallet)
                const balanceReceiver = await Balances.findOne({user:idReceiver, coins:Types.ObjectId('5fa8ac7b2c89c5229459f9fc')})
                const walletReceiver = await Wallets.findById(balanceReceiver.wallet)

        
                if(balanceSender.balance < value + 2 ){
                    return response_express.exception(res, `Your ${coin} not enough!`)
                }
        
                balanceSender.balance = balanceSender.balance - value
                balanceReceiver.balance = balanceReceiver.balance + value
                addressFrom = walletSender.address
                addressTo = walletReceiver.address
                coins = balanceSender.coins
        
                await balanceSender.save()
                await balanceReceiver.save()
            }
            if(coin === 'usdt_trc'){
                const balanceSender = await Balances.findOne({user:idSender, coins:Types.ObjectId('5f882b3e52badd1984a7f071')})
                const walletSender = await Wallets.findById(balanceSender.wallet)
                const balanceReceiver = await Balances.findOne({user:idReceiver, coins:Types.ObjectId('5f882b3e52badd1984a7f071')})
                const walletReceiver = await Wallets.findById(balanceReceiver.wallet)
        
                if(balanceSender.balance < value + 2 ){
                    return response_express.exception(res, `Your ${coin} not enough!`)
                }
                balanceSender.balance = balanceSender.balance - value
                balanceReceiver.balance = balanceReceiver.balance + value
                addressFrom = walletSender.address
                addressTo = walletReceiver.address
                coins = balanceSender.coins
        
                await balanceSender.save()
                await balanceReceiver.save()
            }
            if(coin === 'trx'){
                const balanceSender = await Balances.findOne({user:idSender, coins:Types.ObjectId('5f882b3e52badd1984a7f06d')})
                const walletSender = await Wallets.findById(balanceSender.wallet)
                const balanceReceiver = await Balances.findOne({user:idReceiver, coins:Types.ObjectId('5f882b3e52badd1984a7f06d')})
                const walletReceiver = await Wallets.findById(balanceReceiver.wallet)
        
                if(balanceSender.balance < value + 2 ){
                    return response_express.exception(res, `Your ${coin} not enough!`)
                }
        
                balanceSender.balance = balanceSender.balance - value
                balanceReceiver.balance = balanceReceiver.balance + value
        
                addressFrom = walletSender.address
                addressTo = walletReceiver.address
                coins = balanceSender.coins
        
                await balanceSender.save()
                await balanceReceiver.save()
            }
            var transactionSender = new Transaction({
                user: sender._id,
                value: value,
                type: 28,
                from: addressFrom,
                to: addressTo,
                coin: coins
            })
            var transactionReceiver = new Transaction({
                user: receiver._id,
                value: value,
                type: 28,
                from: addressFrom,
                to: addressTo,
                coin: coins
            })
            
            sender.transactions.push(transactionSender._id)
            receiver.transactions.push(transactionReceiver._id)
            await transactionSender.save()
            await transactionReceiver.save()
            await sender.save()
            await receiver.save()
            return response_express.success(res,transactionSender)
        }catch(er){
            response_express.exception(res,er)
        }
    })
    
    // Trả lãi ngày
    router.post('/profit_everyday',async (req, res)=>{
        try{
            let missField = checkMissParams(res, req.query, ["idIV"])
            if (missField){
                console.log("Miss param at Create Field");
                return;
            }
            const {idIV,idMG} = req.query
            var addressTo
            var balance_after = 0
            var invest =  await Invest.findById(idIV)
            console.log(invest,'Nguyen Duy Tra', idMG)
            if(!invest){    
                return response_express.exception(res,"false, dong 128")
            }

            var profit = invest.value * 0.004

            if(checkActivateDate(invest.create_date) === false){
                return response_express.exception(res,"false, dong 134")
            }

            if(invest.isClosed ===  true){
                return response_express.exception(res,"false, dong 137")
            }
            //tu invest lay ra dc loi nhuan

            var {user} = invest

            //Tim 1 thang invest co close = false user = user cua invest vua tim 

            var find_oldest_invest = await Invest.findOne({
                user : user,
                isClosed : false
            })

            const userReal = await User.findById(user)

            if(find_oldest_invest.current_profit + profit <= find_oldest_invest.max_profit){
                find_oldest_invest.current_profit += profit
                userReal.reinvest_balance += profit
            }

            if(find_oldest_invest.current_profit + profit > find_oldest_invest.max_profit){
                balance_after = profit -  (find_oldest_invest.max_profit - find_oldest_invest.current_profit)
                userReal.reinvest_balance += profit - balance_after
                find_oldest_invest.current_profit = find_oldest_invest.max_profit
                find_oldest_invest.isClosed = true
            }
            
            await find_oldest_invest.save() 
            await userReal.save()

            while(balance_after > 0){
                var find_oldest_invest_a = await Invest.findOne({
                    user : user,
                    isClosed : false
                })

                if(!find_oldest_invest_a){
                    break;
                }

                if(find_oldest_invest_a.current_profit + balance_after <= find_oldest_invest_a.max_profit){
                    find_oldest_invest_a.current_profit += balance_after
                    userReal.reinvest_balance += profit
                    userReal.reinvest_balance += profit
                    await find_oldest_invest_a.save()
                    await userReal.save()
                    break
                }
    
                if(find_oldest_invest_a.current_profit + balance_after > find_oldest_invest_a.max_profit){
                    balance_after = balance_after -  (find_oldest_invest_a.max_profit - find_oldest_invest_a.current_profit)
                    userReal.reinvest_balance += (find_oldest_invest_a.max_profit - find_oldest_invest_a.current_profit)
                    find_oldest_invest_a.current_profit = find_oldest_invest_a.max_profit
                    find_oldest_invest_a.isClosed = true
                    await find_oldest_invest_a.save()
                    await userReal.save()
                }
            }
            //

            // for (let index = 0; index < invest.user.wallets.length; index++) {
            //     if(invest.user.wallets[index].chain == '5fa8ac7b2c89c5229459f9fb')
            //     }
            // }
            const wallet = await Wallets.findOne({user: user, chain: Types.ObjectId('5fa8ac7b2c89c5229459f9f5')})
            addressTo = wallet.address

            // var current_profit = invest.current_profit + ((0.4 * invest.value)/100)

            var transactionReceiver = new Transaction({
                user: user,
                value: profit,
                type: 24,
                from: "system",
                to: addressTo,  
                coin: Types.ObjectId("5fa8ac7b2c89c5229459f9f8")
            })

            //Tinh lai loai 4
            var addressParentFrom
            const walletPF = await Wallets.findOne({user: userReal._id, chain: Types.ObjectId('5fa8ac7b2c89c5229459f9f5')})
            addressParentFrom = walletPF.address

            var idUser = userReal.parent

            for (let index = 0; index < 20; index++) {
                var addressParentTo
                const userParent = await User.findById(idUser)
                if(!userParent){
                    break
                }
                if(userParent.level >= userReal.level){
                    break
                }

                const parent_invests = await Invest.find({
                    user : idUser,
                    isClosed : false
                })

                if(parent_invests.length == 0){
                    if(!userParent.parent){
                        break
                    }
                    idUser = userParent.parent
                    continue
                }
                const walletPT = await Wallets.findOne({user: idUser, chain: Types.ObjectId('5fa8ac7b2c89c5229459f9f5')})
                addressParentTo = walletPT.address

                var balance_T4 = 0
                switch(userParent.level){
                    case 1:
                        balance_T4 = 0.03 * profit
                        break
                    case 2:
                        balance_T4 = 0.06 * profit
                        break
                    case 3:
                        balance_T4 = 0.09 * profit
                        break
                    case 4: 
                        balance_T4 = 0.12 * profit
                        break
                }

                let z = 0

                while(z < parent_invests.length){
                    if(parent_invests[z].current_profit + balance_T4  < parent_invests[z].max_profit){
                        userParent.points += balance_T4 * 0.2
                        parent_invests[z].current_profit += balance_T4 * 0.8
                        userParent.reinvest_balance += balance_T4 * 0.8
                        var transactionT4 = new Transaction({
                            user: user,
                            value: balance_T4,
                            type: 26,
                            from: addressParentFrom,
                            to: addressParentTo,
                            coin: Types.ObjectId("5fa8ac7b2c89c5229459f9f8")
                        })
                        await userParent.save()
                        await transactionT4.save()
                        break
                    }
                    if(parent_invests[z].current_profit + balance_T4 == parent_invests[z].max_profit){
                        userParent.points += balance_T4 * 0.2
                        parent_invests[z].current_profit += balance_T4 * 0.8
                        userParent.reinvest_balance += balance_T4 * 0.8
                        parent_invests[z].isClosed = true
                        await parent_invests.save()
                        var transactionT4 = new Transaction({
                            user: user,
                            value: balance_T4,
                            type: 26,
                            from: addressParentFrom,
                            to: addressParentTo,
                            coin: Types.ObjectId("5fa8ac7b2c89c5229459f9f8")
                        })

                        await userParent.save()
                        await transactionT4.save()
                        break
                    }
                    if(parent_invests[z].current_profit + balance_T4 > parent_invests[z].max_profit){
                        const balance_full4 = parent_invests[z].max_profit - parent_invests[z].current_profit
                        userParent.points += balance_full4 * 0.2
                        parent_invests[z].current_profit += balance_full4 * 0.8
                        userParent.reinvest_balance += balance_T4 * 0.8
                        balance_T4 = balance_T4 - balance_full4
                        var transactionT4 = new Transaction({
                            user: userParent._id,
                            value: balance_full4,
                            type: 26,
                            from: addressParentFrom,
                            to: addressParentTo,
                            coin: Types.ObjectId("5fa8ac7b2c89c5229459f9f8")
                        })

                        await userParent.save()
                        await transactionT4.save()
                        parent_invests[z].current_profit = parent_invests[z].max_profit
                        parent_invests[z].isClosed = true
                        z++
                    }
                }


                if(userParent.childs.length <= index){
                    if(!userParent.parent){
                        break
                    }
                    idUser = userParent.parent
                    continue
                }

                var balance_layer = 0
                var type = 0

                switch(index){
                    case 0:
                        balance_layer = 0.25 * profit
                        type = 1
                        break
                    case 1:
                        var balance_layer = 0.18 * profit
                        type = 2
                        break
                    case 2:
                        var balance_layer = 0.12 * profit
                        type = 3
                        break
                    case 3:
                        var balance_layer = 0.06 * profit
                        type = 4
                        break
                    case 4:
                        var balance_layer = 0.03 * profit
                        type = 5
                        break
                    case 5:
                        var balance_layer = 0.03 * profit
                        type = 6
                        break
                    case 6:
                        var balance_layer = 0.02 * profit
                        type = 7
                        break
                    case 7:
                        var balance_layer = 0.02 * profit
                        type = 8
                        break
                    case 8:
                        var balance_layer = 0.02 * profit
                        type = 9
                        break
                    case 9:
                        var balance_layer = 0.02 * profit
                        type = 10
                        break
                    case 10:
                        var balance_layer = 0.02 * profit
                        type = 11
                        break
                    case 11:
                        var balance_layer = 0.02 * profit
                        type = 12
                        break
                    case 12:
                        var balance_layer = 0.02 * profit
                        type = 13
                        break
                    case 13:
                        var balance_layer = 0.02 * profit
                        type = 14
                        break
                    case 14:
                        var balance_layer = 0.02 * profit
                        type = 15
                        break
                    case 15:
                        var balance_layer = 0.01 * profit
                        type = 16
                        break
                    case 16:
                        var balance_layer = 0.01 * profit
                        type = 17
                        break
                    case 17:
                        var balance_layer = 0.01 * profit
                        type = 18
                        break
                    case 18:
                        var balance_layer = 0.01 * profit
                        type = 19
                        break
                    case 19:
                        var balance_layer = 0.01 * profit
                        type = 20
                        break
                    default:
                        console.log('none')
                    }

                    let y = 0
                    while( y < parent_invests.length){
                        if(parent_invests[y].current_profit + balance_layer  < parent_invests[y].max_profit){
                            userParent.points += balance_layer * 0.2
                            parent_invests[y].current_profit += balance_layer * 0.8
                            userParent.reinvest_balance += balance_layer * 0.8
                            await parent_invests[y].save()
                            var transactionT3 = new Transaction({
                                user: userParent._id,
                                value: balance_layer,
                                type: type,
                                from: addressParentFrom,
                                to: addressParentTo,
                                coin: Types.ObjectId("5fa8ac7b2c89c5229459f9f8")
                            })
                            await userParent.save()
                            await transactionT3.save()
                            break
                        }
                        if(parent_invests[y].current_profit + balance_layer == parent_invests[y].max_profit){
                            userParent.points += balance_layer * 0.2
                            parent_invests[y].current_profit += balance_layer * 0.8
                            userParent.reinvest_balance += balance_layer * 0.8
                            parent_invests[y].isClosed = true
                            await parent_invests.save()
                            var transactionT3 = new Transaction({
                                user: userParent._id,
                                value: balance_layer,
                                type: type,
                                from: addressParentFrom,
                                to: addressParentTo,
                                coin: Types.ObjectId("5fa8ac7b2c89c5229459f9f8")
                            })

                            await userParent.save()
                            await transactionT3.save()
                            break
                        }
                        if(parent_invests[y].current_profit + balance_layer > parent_invests[y].max_profit){
                            const balance_full = parent_invests[y].max_profit - parent_invests[y].current_profit
                            balance_layer = balance_layer - balance_full
                            userParent.points += balance_full * 0.2
                            parent_invests[y].current_profit += balance_full * 0.8
                            userParent.reinvest_balance += balance_full * 0.8
                            var transactionT3 = new Transaction({
                            user: userParent._id,
                            value: balance_full,
                            type: type,
                            from: addressParentFrom,
                            to: addressParentTo,
                            coin: Types.ObjectId("5fa8ac7b2c89c5229459f9f8")
                            })
                            await userParent.save()
                            await transactionT3.save()
                            parent_invests[y].current_profit = parent_invests[y].max_profit
                            parent_invests[y].isClosed = true
                            await parent_invests[y].save()
                        }
                        y++
                    }
                if(!userParent.parent){
                    break
                }
                idUser = userParent.parent
            }

            await invest.save()
            await transactionReceiver.save()
            return response_express.success(res,"thanh cong")
        } catch(er){
            console.log(er);
            return response_express.exception(res,`${er}, fail at 475`)
        }
    })

    // Trả lãi loại 2, nhận trực tiếp dựa trên số tiền đầu tư ngay khi F1 nộp tiền vào ví

    router.post('/direct_comission',async (req, res)=>{
        try{
            if(req.body.caller !== 'admin'){
                return response_express.exception(res,`fail at 485`);
            }
            let missField = checkMissParams(res, req.query, ["idUser", "value","addressFrom"])
            if (missField){
                console.log("Miss param at Create Field");
                return;
            }
            const {idUser, value, addressFrom} = req.query
            const valueInt = parseInt(value)
            var addressTo
            var balance_after = 0
            var invest =  await Invest.findOne({
                user : idUser,
                isClosed : false
            })
            var user = await User.findById(idUser)
            
            if(invest){
                if(checkActivateDate(invest.create_date) === false){
                    return response_express.exception(res,"false")
                }

                if(invest.isClosed ===  true){
                    return response_express.exception(res,"false")
                }

                //tu invest lay ra dc loi nhuan

                if(invest.current_profit + valueInt <= invest.max_profit){
                    invest.current_profit += valueInt
                    user.reinvest_balance += value
                }

                if(invest.current_profit + valueInt > invest.max_profit){
                    balance_after = valueInt -  (invest.max_profit - invest.current_profit)
                    invest.current_profit = invest.max_profit
                    invest.isClosed = true
                }
                
                await invest.save() 

                while(balance_after > 0){
                    var invest_a = await Invest.findOne({
                        user : idUser,
                        isClosed : false
                    })
                    console.log(invest_a);

                    if(!invest_a){
                        break;
                    }

                    if(invest_a.current_profit + balance_after <= invest_a.max_profit){
                        invest_a.current_profit += balance_after
                        await invest_a.save()
                        break
                    }
        
                    if(invest_a.current_profit + balance_after > invest_a.max_profit){
                        balance_after = balance_after -  (invest_a.max_profit - invest_a.current_profit)
                        invest_a.current_profit = invest_a.max_profit
                        invest_a.isClosed = true
                    }
                    await invest_a.save() 
                }
                //

                // for (let index = 0; index < invest.user.wallets.length; index++) {
                //     if(invest.user.wallets[index].chain == '5fa8ac7b2c89c5229459f9fb')
                //     }
                // }
                const wallet = await Wallets.findOne({user: idUser, chain: Types.ObjectId('5fa8ac7b2c89c5229459f9f5')})
                addressTo = wallet.address

                // var current_profit = invest.current_profit + ((0.4 * invest.value)/100)

                var transactionReceiver = new Transaction({
                    user: invest.user._id,
                    value: value,
                    type: 25,
                    from: addressFrom,
                    to: addressTo,
                    coin: Types.ObjectId("5fa8ac7b2c89c5229459f9f8")
                })

                await invest.save() 
                await transactionReceiver.save()
                return response_express.success(res,"thanh cong")
            }
        } catch(er){
            console.log(er);
            return response_express.exception(res,er)
        }
    })
}   