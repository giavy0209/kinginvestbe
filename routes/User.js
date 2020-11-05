const {Types} = require('mongoose')
const path = require('path')
const Users = require('../models/Users');
const Wallets = require('../models/Wallets');
const Balances = require('../models/Balances');
const userCode = require('../models/userCode');
const VARIABLE = require(path.join(__dirname, '../variable'))
const lib_common = require(VARIABLE.LIBS_DIR+'/commons');
const auth_lib = require(VARIABLE.LIBS_DIR+'/auth');
const lib_password = require(VARIABLE.LIBS_DIR + '/password');
const response_express = require(VARIABLE.LIBS_DIR + '/responses').response_express
const btc_f = require(VARIABLE.BLC_DIR + '/btc_functions');
const erc_f = require(VARIABLE.BLC_DIR +'/erc20_functions');
const tron_f = require(VARIABLE.BLC_DIR + '/tron_functions');
const tomo_f = require(VARIABLE.BLC_DIR + '/tomo_functions');
const Auth = require(VARIABLE.AUTH_DIR + '/auth')
const validator = require('validator')

module.exports = async router => {
    router.get('/user',Auth.isAdminAuthenticated, async ( req, res)  => {
        const { skip, take, search , sort,kyc  } = req.query;
        var _skip = parseInt(skip);
        var _take = parseInt(take)

        const query = {
            isLock : {$ne: true}
        }

        if(search && search !== ''){
            query.$or = [
                {email : {$regex : `.*${search}.*`}},
                {ref_code : {$regex : `.*${search}.*`}},
                {parent : {$regex : `.*${search}.*`}},
                // {trx_address : {$regex : `.*${search}.*`}},
                // {erc_address : {$regex : `.*${search}.*`}},
            ]
        }

        if(kyc && kyc !== ''){
            query.kyc.signal = kyc
        }

        if(sort === '3'){
            query.isLock = true
        }

        try
        {
            let total = await Users.countDocuments(query)
            let users = await Users.find(query, {
            }, {skip: _skip, limit: _take})
            .populate('parent')
            .populate({
                path: 'childs',
                options: { sort: { create_date: -1 }}
            })
            .populate({
                path : 'wallets',
                populate : {
                    path : 'balances'
                }
            })
            .populate({
                path:'transactions',
                options: { sort: { create_date: -1 }}
            })
            .populate({
                path:'invests',
                options: { sort: { create_date: -1 }}
            })
            // .populate('lucky_spin_historys')
            .sort(
                sort === '0' ? 
                {create_date : -1} : 
                sort === '1' ? 
                {level : -1} : 
                sort === '2' ? 
                {"kyc.last_date" : -1} : 
                sort === '4' ? 
                {points : -1} : 
                sort === '5' ? 
                {transactions : {$size : -1}} : 
                sort === '6' ? 
                {invests : {$size : -1}}  : 
                {_id : -1}
            );
            console.log(users);
            const data = {
                total: total,
                users: users
            }
            return response_express.success(res, data)
        }
        catch(er){
            return response_express.exception(res, 'Server iss not response!')
        }
    })
    .get('/user-me',Auth.expressMiddleware, async ( req, res)  => {
        try
        {
            const id = req.token_info._id
            var find_user =  await Users.findOne({ _id: id})
            .populate({
                path : 'wallets',
                populate : {
                    path : 'balances'
                }
            })
            .populate({
                path: 'childs',
                options: { sort: { create_date: -1 }}
            })
            .populate({
                path: 'transactions',
                options: { sort: { create_date: -1 }}
            })
            .populate({
                path:'invests',
                options: { sort: { create_date: -1 }}
            })
            if(find_user !== null) {
                return response_express.success(res, find_user)
            } else {
                return response_express.exception(res, 'Not found user')
            }
        }
        catch(er){
            return response_express.exception(res, 'Server is not response!')
        }
    })

    .post('/user', async ( req, res)  => {
        console.log(req.body);
        let missField = lib_common.checkMissParams(res, req.body, ["email", "password","ref_code"])
        if (missField){
            console.log("Miss param at Create Field");
            return res.send({
                status : 100,
            });
        } 

        lib_password.cryptPassword(req.body.password)
        .then(async passwordHash => {
            delete req.body.password;
            req.body.password = passwordHash;
            const ref_user = await Users.findOne({ref_code: req.body.ref_code})
            req.body.parent = ref_user._id

            var user = new Users(req.body)
            user.ref_code = user._id
            var btc_wallet = await btc_f.createBTCWallet();
            var wl1 = new Wallets({
                user: user._id,
                chain: '5f8a664dec6abf1b6089bda3',
                address: btc_wallet.address,
                private_key: btc_wallet.privateKey
            })
            var balance1 = new Balances({
                user : user._id,
                chain : '5f8a664dec6abf1b6089bda3',
                wallet : wl1._id,
                coins : '5f882b3e52badd1984a7f06b',
            })

            wl1.balances.push(balance1._id)
            user.wallets.push(wl1._id)
            console.log(balance1);
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
            await Users.findOneAndUpdate({ref_code: req.body.ref_code}, { $push: { childs: user._id} }).exec()
            response_express.success(res);
        })
        .catch(err => {
            console.log(err);
            response_express.exception(res, err);
        })    
    })

    // login 
    .post('/login_kif',async(req, res)=>{
        let miss = lib_common.checkMissParams(res, req.body, ["email", "password"])
        if (miss){
            console.log("Miss param at Login");
            return response_express.exception(res, `Miss param at ${miss}`)
        }

        const user = await Users.findOne({email: req.body.email})
        if(!user){
            return response_express.exception(res, `Email not exist!`)
        }
        let tokenPayload = {
            _id: user._id,
            email: user.email,
        }
        return Promise.all([
            lib_password.comparePassword(req.body.password, user.password),
            lib_common.createToken(tokenPayload, 1800000),
        ])
        .then(result => {
            let isMatchPassword = result[0];
            let accessToken = result[1];
            if(!isMatchPassword){
                return Promise.reject("Password not match")
            }
            console.log("login successfull")
            return response_express.success(res, {user, jwt:accessToken})
        })
        .catch(err=>{
            response_express.exception(res, err.message || err);
        })
    })
    

    .put('/user-kyc',Auth.expressMiddleware ,async ( req, res)  => {
        try{
            const {kyc} = req.body
            const id = req.token_info._id
            // console.log(auth_lib.isAdminAuthenticated(req));
            if(kyc.signal && auth_lib.isAdminAuthenticated(req) === false){
                return
            }
            if(!kyc || typeof kyc !== 'object' || !id || !Types.ObjectId.isValid(id)){
                return
            }
            const updates = Object.keys(kyc)
            const allowedUpdates = ['name','phone','id','birthday','images', 'signal']
            var user = await Users.findById(id)
            updates.forEach(_update => {
                if(allowedUpdates.includes(_update)){
                    user.kyc[_update] = kyc[_update]
                }
            })
            user.kyc.last_date = new Date()
            await user.save()
            return response_express.success(res, user)
        }catch(er){
            return response_express.exception(res, er)
        }
    })

    .put('/confirm-kyc',Auth.isAdminAuthenticated ,async ( req, res)  => {
        try{
            const {id} = req.body
            // console.log(auth_lib.isAdminAuthenticated(req));
            var user = await Users.findById(id)
            if(!user){
                return response_express.exception(res, 'have not user')
            }
            user.kyc.signal = true
            await user.save()
            return response_express.success(res, user)
        }catch(er){
            return response_express.exception(res, er)
        }
    })


    .put('/forgot-password', async ( req, res)  => {    
        try
        {
            const { email, forgot_password_code, new_password } = req.body;

            if(email === null || email === undefined ||email.trim().length === 0 || !validator.isEmail(email)) {
                return response_express.exception(res,'email is not exist!' )
            }

            if(new_password === null || new_password === undefined ||new_password.trim().length === 0) {
                return response_express.exception(res, 'password is empty')
            }
            

            if(forgot_password_code === null || forgot_password_code === undefined || forgot_password_code.trim().length === 0) {
                return response_express.exception(res, 'forgot password code is empty')
            }

            let find_user_code = await userCode.findOne({ email: email });
            console.log(find_user_code);
            console.log('sjsjsj');
            if(!find_user_code) {
                return response_express.exception(res, 'email (forgot password code) is not exist')
            } else {
                if(find_user_code.code !== forgot_password_code) {
                    return response_express.exception(res, 'forgot passsword code is wrong')
                }
            }
            
            // Quá 10 phút là không cho register nữa
            // var now_date = new moment();
            // var diff_minute = moment(now_date).subtract(find_user_code.create_date).minutes();

            // if(diff_minute > 10) {
            //     return res.status(200).send({
            //         status: 101,
            //         err: "forgot passsword code is not valid beacause over 10 minutes"
            //     });
            // }

            let find_user_by_email = await Users.findOne({ email: email });

            if(!find_user_by_email) {
                return response_express.exception(res, 'email is not exist')
            }

            lib_password.cryptPassword(new_password)
            .then(async result=>{
                let edit_user = await Users.findByIdAndUpdate(find_user_by_email._id, {
                    password: result,
                });

                await userCode.findByIdAndUpdate(find_user_by_email._id, {
                    code: "",
                });
                return response_express.success(res, edit_user)
            })
        }
        catch(er){
            return response_express.exception(res, er)
        }
    })

    .put(`/change_password`, Auth.expressMiddleware, async (req, res) => {
        try
        {
            const {old_password, new_password } = req.body;

            if(old_password === null || old_password === undefined || old_password.trim().length === 0) {
                return response_express.exception(res, "old password is empty")
            }

            if(new_password === null || new_password === undefined ||new_password.trim().length === 0) {
                return response_express.exception(res, "new password is empty")
            }

            let find_user = await Users.findOne({ _id: req.token_info._id });
            // console.log(find_user);
            if(!find_user) {
                return response_express.exception(res, "user is not exist")
            } 
            else{
                lib_password.comparePassword(old_password, find_user.password)
                .then(async result =>{
                    console.log(result);
                    if(!result){
                        return response_express.exception(res, "old password is wrong!")
                    }
                    lib_password.cryptPassword(new_password)
                        .then(async hash =>{
                            let update_user = await Users.findByIdAndUpdate(find_user._id, {
                                password: hash
                            });
                            return response_express.success(res, update_user)
                        })
                    })
                }
            }catch(er){
            return response_express.exception(res, er)
        }
    });
}