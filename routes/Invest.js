const {Types} = require('mongoose')
const axios = require('axios')
const fetch = require("node-fetch");

const VARIABLE = require('../variable')
const User = require(VARIABLE.MODELS_DIR + '/Users')
const Invest = require(VARIABLE.MODELS_DIR + '/Invests')
const Balances = require(VARIABLE.MODELS_DIR + '/Balances')
const Wallets = require(VARIABLE.MODELS_DIR + '/Wallets')
const Transaction = require(VARIABLE.MODELS_DIR + '/Transactions')
const response_express = require(VARIABLE.LIBS_DIR + '/responses').response_express
const Auth = require(VARIABLE.AUTH_DIR + '/auth')
const Common  = require(VARIABLE.LIBS_DIR + '/commons')


module.exports = router =>{
    router.post('/invest',Auth.expressMiddleware,async (req, res)=>{
        try{
            var address_owner
            const {value, coin} = req.body
            const id = req.token_info._id
            const max_profit = value * 2.7
            var address
            var coins
            const user = await User.findById(id)
            if(coin === 'eth'){
                var link = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd";
                var data = await fetch(link);
                data = await data.json();
                const usdValue = data.ethereum.usd * value
                if(usdValue < 100 || usdValue >50000){
                    return response_express.exception(res,'amount Invest beyonds range of allowed Invest')
                }
                
                const balance = await Balances.findOne({user:id, coins:Types.ObjectId('5fa8ac7b2c89c5229459f9fc')})
                const wallet = await Wallets.findById(balance.wallet)

                if(balance.balance < value + 2 ){
                    return response_express.exception(res, `Your ${coin} not enough!`)
                }
                balance.balance = balance.balance - value
                address = wallet.address
                coins = balance.coins
                address_owner = VARIABLE.OWNER_ADDRESS_ERC20

                await balance.save()
            }
            if(coin === 'usdt_trc'){
                var link = "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd";
                var data = await fetch(link);
                data = await data.json();
                const usdValue = data.tether.usd * value
                if(usdValue < 100 || usdValue >50000){
                    return response_express.exception(res,'amount Invest beyonds range of allowed Invest')
                }
                const balance = await Balances.findOne({user:id, coins:Types.ObjectId('5fa8ac7b2c89c5229459f9f8')})
                const wallet = await Wallets.findById(balance.wallet)

                if(balance.balance < value + 2 ){
                    return response_express.exception(res, `Your ${coin} not enough!`)
                }
                balance.balance = balance.balance - value
                address = wallet.address
                coins = balance.coins
                address_owner = VARIABLE.OWNER_ADDRESS_TRC20
                await balance.save()
            }
            if(coin === 'trx'){
                var link = "https://api.coingecko.com/api/v3/simple/price?ids=tron&vs_currencies=usd";
                console.log('tra');
                var data = await fetch(link);
                data = await data.json();
                const usdValue = data.tron.usd * value
                if(usdValue < 100 || usdValue >50000){
                    return response_express.exception(res,'amount Invest beyonds range of allowed Invest')
                }
                const balance = await Balances.findOne({user:id, coins:Types.ObjectId('5fa8ac7b2c89c5229459f9f6')})
                const wallet = await Wallets.findById(balance.wallet)

                if(balance.balance < value + 2 ){
                    return response_express.exception(res, `Your ${coin} not enough!`)
                }
                balance.balance = balance.balance - value
                address = wallet.address
                coins = balance.coins
                address_owner = VARIABLE.OWNER_ADDRESS_TRC20
                await balance.save()
            }

            var transaction = new Transaction({
                user: req.token_info._id,
                value: value,
                type: 23,
                from: address,
                to: address_owner,
                coin: coins
            })

            var invest  = new Invest({
                user: id,
                max_profit: max_profit,
                value: value
            })

            user.invests.push(invest._id)
            user.transactions.push(transaction._id)

            Common.checkLevel(id)

            await transaction.save()
            await invest.save()
            await user.save()

            const a = await axios.post(VARIABLE.DOMAIN_MAIN+`/direct_comission?idUser=${user.parent}&&value=${value * 0.03}&&addressFrom=${address}`,
                {caller: 'admin'})
            if(a.data.status === 0){
                return response_express.exception(res,'direct comision!')
            }

            return response_express.success(res,invest)
        }catch(er){
            response_express.exception(res,er)
        }
    })

    router.post('/re_invest',Auth.expressMiddleware,async (req, res)=>{
        try{
            var address_owner
            const {value} = req.body
            const id = req.token_info._id
            const max_profit = value * 2.7
            var address
            var coins
            const user = await User.findById(id)
            if(user.reinvest_balance <= 50 || value > user.reinvest_balance){
                return response_express.exception(res, 'You can not reinvest!')
            }
            var link = "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd";
            var data = await fetch(link);
            data = await data.json();
            const usdValue = data.tether.usd * value
            if(usdValue < 100 || usdValue >50000){
                return response_express.exception(res,'amount Invest beyonds range of allowed Invest')
            }
            const balance = await Balances.findOne({user:id, coins:Types.ObjectId('5fa8ac7b2c89c5229459f9f8')})
            const wallet = await Wallets.findById(balance.wallet)

            user.reinvest_balance = user.reinvest_balance - value
            address = wallet.address
            coins = balance.coins
            address_owner = VARIABLE.OWNER_ADDRESS_TRC20

            var transaction = new Transaction({
                user: id,
                value: value,
                type: 28,
                from: address,
                to: address_owner,
                coin: Types.ObjectId("5fa8ac7b2c89c5229459f9f8")
            })

            var invest  = new Invest({
                user: id,
                max_profit: max_profit,
                value: value
            })

            user.invests.push(invest._id)
            user.transactions.push(transaction._id)

            await transaction.save()
            await invest.save()
            await user.save()
            Common.checkLevel(id)

            const a = await axios.post(VARIABLE.DOMAIN_LOCAL+`/direct_comission?idUser=${user.parent}&&value=${value * 0.03}&&addressFrom=${address}`,
                {caller: 'admin'})
            if(a.data.status === 0){
                return response_express.exception(res,'direct comision!')
            }

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