const {Types} = require('mongoose')

const VARIABLE = require('../variable')
const User = require(VARIABLE.MODELS_DIR + '/Users')
const Invest = require(VARIABLE.MODELS_DIR + '/Invests')
const Balances = require(VARIABLE.MODELS_DIR + '/Balances')
const Wallets = require(VARIABLE.MODELS_DIR + '/Wallets')
const Transaction = require(VARIABLE.MODELS_DIR + '/Transactions')
const response_express = require(VARIABLE.LIBS_DIR + '/responses').response_express
const Auth = require(VARIABLE.AUTH_DIR + '/auth')
const btc_f = require(VARIABLE.BLC_DIR + '/btc_functions');
const erc_f = require(VARIABLE.BLC_DIR +'/erc20_functions');
const tron_f = require(VARIABLE.BLC_DIR + '/tron_functions');
const tomo_f = require(VARIABLE.BLC_DIR + '/tomo_functions');

const address_owner = 'usdt_erc20'

module.exports = router =>{
    router.post('/invest',Auth.expressMiddleware,async (req, res)=>{
        try{
            const {value, type, coin} = req.body
            const id = req.token_info._id
            console.log(id);
            const max_profit = value * 2.7
            var address
            var coins
            const user = await User.findById(id)
            if(coin === 'eth'){
                const balance = await Balances.findOne({user:id, coins:Types.ObjectId('5f882b3e52badd1984a7f06c')})
                const wallet = await Wallets.findById(balance.wallet)

                if(balance.balance < value + 2 ){
                    return response_express.exception(res, `Your ${coin} not enough!`)
                }
                balance.balance = balance.balance - value
                address = wallet.address
                coins = balance.coins
                await balance.save()
            }
            if(coin === 'usdt_trc'){
                const balance = await Balances.findOne({user:id, coins:Types.ObjectId('5f882b3e52badd1984a7f071')})
                const wallet = await Wallets.findById(balance.wallet)

                if(balance.balance < value + 2 ){
                    return response_express.exception(res, `Your ${coin} not enough!`)
                }
                balance.balance = balance.balance - value
                address = wallet.address
                coins = balance.coins
                await balance.save()
            }
            if(coin === 'trx'){
                const balance = await Balances.findOne({user:id, coins:Types.ObjectId('5f882b3e52badd1984a7f06d')})
                const wallet = await Wallets.findById(balance.wallet)

                if(balance.balance < value + 2 ){
                    return response_express.exception(res, `Your ${coin} not enough!`)
                }
                balance.balance = balance.balance - value
                address = wallet.address
                coins = balance.coins
                await balance.save()
            }

            var transaction = new Transaction({
                user: req.token_info._id,
                value: value,
                type: type,
                from: address,
                to: address_owner,
                coin: coins
            })

            var invest  = new Invest({
                user: req.token_info._id,
                max_profit: max_profit,
                value: value
            })

            user.invests.push(invest._id)
            user.transactions.push(transaction._id)
            await transaction.save()
            await invest.save()
            await user.save()
            return response_express.success(res,invest)
        }catch(er){
            response_express.exception(res,er)
        }
    })

    router.get('/invests/:id',async(req,res)=>{
        const id = req.params.id
        try{
            const invest = await Invest.findById(id)
            .populate({
                path: 'transaction',
                options: { sort: { create_date: -1 }}
            })
            return response_express.success(res, invest)
        }catch(er){
            response_express.exception(res,er)
        }
    })

    router.get('/invests', async ( req, res)  => {
        const { skip, take,isClosed  } = req.query;
        var _skip = parseInt(skip);
        var _take = parseInt(take)
        console.log(req.query);

        const query = {}

        // if(search && search !== ''){
        //     query.$or = [
        //         {user : {$regex : `.*${search}.*`}},
        //         // {ref_code : {$regex : `.*${search}.*`}},
        //         // {parent : {$regex : `.*${search}.*`}},
        //         // {trx_address : {$regex : `.*${search}.*`}},
        //         // {erc_address : {$regex : `.*${search}.*`}},
        //     ]
        // }

        if(isClosed && isClosed !== ''){
            query.isClosed = isClosed
        }

        try
        {
            let total = await Invest.countDocuments(query)
            let users = await Invest.find(query, {
            }, {skip: _skip, limit: _take})
            .sort(sort={create_date : -1}) 
            const data = {
                total: total,
                invest: users
            }
            console.log(data);
            return response_express.success(res, data)
        }
        catch(er){
            return response_express.exception(res, 'Server iss not response!')
        }
    })
}