const {Types} = require('mongoose')

const VARIABLE = require('../variable')
const User = require(VARIABLE.MODELS_DIR + '/Users')
const Invest = require(VARIABLE.MODELS_DIR + '/Invests')
const Balances = require(VARIABLE.MODELS_DIR + '/Balances')
const Wallets = require(VARIABLE.MODELS_DIR + '/Wallets')
const Transaction = require(VARIABLE.MODELS_DIR + '/Transactions')
const response_express = require(VARIABLE.LIBS_DIR + '/responses').response_express
const Auth = require(VARIABLE.AUTH_DIR + '/auth')


module.exports = router =>{
    router.post('/pay_profit/:id',Auth.expressMiddleware,async (req, res)=>{
        try{
            const {value, coin} = req.body
            const idSender = req.token_info._id
            const idReceiver = req.params.id
            var addressFrom
            var addressTo
            var coins
            const sender = await User.findById(idSender)
            const receiver = await User.findById(idReceiver)
            if(coin === 'eth'){
                const balanceSender = await Balances.findOne({user:idSender, coins:Types.ObjectId('5f882b3e52badd1984a7f06c')})
                const walletSender = await Wallets.findById(balanceSender.wallet)
                const balanceReceiver = await Balances.findOne({user:idReceiver, coins:Types.ObjectId('5f882b3e52badd1984a7f06c')})
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
                value: 28,
                type: type,
                from: addressFrom,
                to: addressTo,
                coin: coins
            })
            user.transactions.push(transaction._id)
            await transactionSender.save()
            await transactionReceiver.save()
            await sender.save()
            await receiver.save()
            return response_express.success(res,transactionSender)
        }catch(er){
            response_express.exception(res,er)
        }
    })
}