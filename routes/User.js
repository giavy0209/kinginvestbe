const {Types} = require('mongoose')
const path = require('path')
const Users = require('../models/Users');
const Wallets = require('../models/Wallets');
const Balances = require('../models/Balances');
const VARIABLE = require(path.join(__dirname, '../variable'))
const lib_common = require(VARIABLE.LIBS_DIR+'/commons');
const lib_password = require(VARIABLE.LIBS_DIR + '/password');
const response_express = require(VARIABLE.LIBS_DIR + '/responses').response_express
const btc_f = require(VARIABLE.BLC_DIR + '/btc_functions');
const erc_f = require(VARIABLE.BLC_DIR +'/erc20_functions');
const tron_f = require(VARIABLE.BLC_DIR + '/tron_functions');
const tomo_f = require(VARIABLE.BLC_DIR + '/tomo_functions');

module.exports = async router => {
    router.get('/user', async ( req, res)  => {
        const {
            skip ,
            limit ,
            sort ,
        } = req.query

        
    })
    .get('/user-by-id', async ( req, res)  => {
        const {id} = req.query

        //find id
    })

    .post('/user', async ( req, res)  => {
        
        let missField = lib_common.checkMissParams(res, req.body.user, ["email", "password","ref_code"])
        if (missField){
            console.log("Miss param at Create Field");
            return;
        } 

        lib_password.cryptPassword(req.body.password)
        .then(async passwordHash => {
            delete req.body.password;
            req.body.password = passwordHash;
            const ref_user = await Users.findOne({ref_code: req.body.ref_code})
            req.body.parent = ref_user._id

            var user = new Users(req.body)
            // console.log(req.body.user)
            var btc_wallet = await btc_f.createBTCWallet();
            var wl1 = new Wallets({
                user: user._id,
                chain: '5f8a664dec6abf1b6089bda3',
                address: btc_wallet.address,
                private_key: btc_wallet.privateKey
            })
            // await user.save()

            var balance1 = new Balances({
                user : user._id,
                chain : '5f8a664dec6abf1b6089bda3',
                wallet : wl1._id,
                coins : '5f882b3e52badd1984a7f06b',
            })

            wl1.balances.push(balance1._id)
            user.wallets.push(wl1._id)
            await balance1.save()
            await wl1.save()

            var erc_wallet = await erc_f.createERCWallet();
            var wl2 = new Wallets({
                user: user._id,
                chain: '5f8a6538a492ec0834bbc7c4',
                address: erc_wallet.address,
                private_key: erc_wallet.privateKey
            })
            var balance2 = new Balances({
                user : user._id,
                chain : '5f8a6538a492ec0834bbc7c4',
                wallet : wl2._id,
                coins : '5f882b3e52badd1984a7f06c',
            })
            var balance3 = new Balances({
                user : user._id,
                chain : '5f8a6538a492ec0834bbc7c4',
                wallet : wl2._id,
                coins : '5f882b3e52badd1984a7f06f',
            })
            var balance4 = new Balances({
                user : user._id,
                chain : '5f8a6538a492ec0834bbc7c4',
                wallet : wl2._id,
                coins : '5f882b3e52badd1984a7f070',
            })
            var balance5 = new Balances({
                user : user._id,
                chain : '5f8a6538a492ec0834bbc7c4',
                wallet : wl2._id,
                coins : '5f8a76a384349519a464f8c2',
            })

            wl2.balances.push(balance2._id)
            wl2.balances.push(balance3._id)
            wl2.balances.push(balance4._id)
            wl2.balances.push(balance5._id)
            user.wallets.push(wl2._id)
            await balance2.save()
            await balance3.save()
            await balance4.save()
            await balance5.save()
            await wl2.save()

            

            var trx_wallet = await tron_f.createTRXWallet();
            var wl3 = new Wallets({
                user: user._id,
                chain: '5f8a65586927ca2d6cfea93a',
                address: trx_wallet.address,
                private_key: trx_wallet.privateKey
            })

            var balance6 = new Balances({
                user : user._id,
                chain : '5f8a65586927ca2d6cfea93a',
                wallet : wl3._id,
                coins : '5f882b3e52badd1984a7f06d',
            })
            var balance7 = new Balances({
                user : user._id,
                chain : '5f8a65586927ca2d6cfea93a',
                wallet : wl3._id,
                coins : '5f882b3e52badd1984a7f06e',
            })
            var balance8 = new Balances({
                user : user._id,
                chain : '5f8a65586927ca2d6cfea93a',
                wallet : wl3._id,
                coins : '5f882b3e52badd1984a7f071',
            })

            wl3.balances.push(balance6._id)
            wl3.balances.push(balance7._id)
            wl3.balances.push(balance8._id)
            user.wallets.push(wl3._id)
            await balance6.save()
            await balance7.save()
            await balance8.save()
            await wl3.save()


            var tomo_wallet = await tomo_f.createTOMOWallet();
            var wl4 = new Wallets({
                user: user._id,
                chain: '5f8a652f971ce603ac432a0a',
                address: tomo_wallet.address,
                private_key: tomo_wallet.privateKey
            })

            var balance9 = new Balances({
                user : user._id,
                chain : '5f8a652f971ce603ac432a0a',
                wallet : wl4._id,
                coins : '5f882b3e52badd1984a7f072',
            })
            wl4.balances.push(balance9._id)
            user.wallets.push(wl4._id)
            await balance9.save()
            await wl4.save()

            return await user.save();
        }).then(async (user) => {
            // console.log(config.ownerSecretKey)
            // let a = await User.findOne({privateKey: config.ownerSecretKey})
            // console.log("sdfadsfadfasdfads")
            // console.log(a)
            await User.findOneAndUpdate({ref_code: req.body.ref_code}, { $push: { childs: user._id} }).exec()
            response_express.success(res);
        })
        .catch(err => {
            response_express.exception(res, err);
        })    
    })
    

    .put('/user', async ( req, res)  => {
        const {kyc} = req.body
        if(!kyc || typeof kyc !== 'object'){
            return
        }
        
    })
    .put('/password', async ( req, res)  => {
        const {
            old_password,
            new_password
        } = req.body
        
    })
}