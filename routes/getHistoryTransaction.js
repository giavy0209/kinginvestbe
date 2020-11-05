const mongoose = require('mongoose');
const VARIABLE = require('../variable')

const Transaction = require(VARIABLE.MODELS_DIR + '/Transactions')
const { response_express } = require('../libs/responses');
var Auth = require(VARIABLE.AUTH_DIR + '/auth'); 

module.exports = (router) => {
    router.get(`/get_transaction`, Auth.expressMiddleware, async (req, res) => {
        const {skip, take, type, start ,end,value, coin} = req.query;
        
        var _skip = skip ? parseInt(skip): 0;
        var _take = take ? parseInt(take): 0
        const id = req.token_info._id

        var query = {}

        if(start && end) {
            const startdate = new Date(start)
            const enddate = new Date(end)

            query.create_date = {$gte : startdate}
            query.create_date = {$lte : enddate}
        }
        if(value){
            query.value = value
        }
        if(coin){
            query.coin = coin
        }

        query.user = mongoose.Types.ObjectId(id)
        if(type){
            query.type = type
        }
        try
        {
            
            let user_transactions = await Transaction.find(query, {}, {skip: _skip, limit: _take}).sort({ create_date: -1})
            return response_express.success(res, user_transactions)
        }
        catch(er){
            return response_express.exception(res,er)
        }
    });
    
    router.get(`/get_transaction/:id`, Auth.expressMiddleware, async (req, res) => {
        const { id } = req.params;
        try
        {
            let user_transactions = await Transaction.findById(id)
            console.log("get_transaction by id")
            console.log(user_transactions)
            return response_express.success(res, user_transactions)
        }
        catch(er){
            return response_express.exception(res, er)
        }
    });

    // router.post(`/create_transaction`, auth_controller.isAuthenticated, async (req, res) => {
    //     try
    //     {
    //         const { userId, from, to, type, value, note } = req.body;
    //         let from_id = "", to_id = "";
    //         let find_from_userId = null, find_to_userId = null;

    //         if(from === "admin") {
    //             let find_admin = await User.findOne({ email: 'admin' });
    //             if(find_admin === null) {
    //                 return res.status(200).send({
    //                     status: 0,
    //                     err: "no find admin",
    //                 });
    //             }
    //             from_id = find_admin._id;
    //         }
    //         else {
    //             find_from_userId = await User.findOne({ _id: from });

    //             if(find_from_userId === null) {
    //                 return res.status(200).send({
    //                     status: 0,
    //                     err: "wrong from userId",
    //                 });
    //             }

    //             from_id = find_from_userId._id
    //         }

    //         if(to === "admin") {
    //             let find_admin = await User.findOne({ email: 'admin' });
    //             if(find_admin === null) {
    //                 return res.status(200).send({
    //                     status: 0,
    //                     err: "no find admin",
    //                 });
    //             }
    //             to_id = find_admin._id;
    //         }
    //         else {
    //             find_to_userId = await User.findOne({ _id: to }).populate("parent_user_id");
    //             if(find_to_userId === null) {
    //                 return res.status(200).send({
    //                     status: 0,
    //                     err: "wrong to userId",
    //                 });
    //             }

    //             to_id = find_to_userId._id
    //         }

    //         if(type === "lucky-spin-daily") {
    //             var now = new Date();
    //             var now_format = dateFormat(now, "mm/dd/yyyy");
                
    //             if(from === "admin") {
    //                 if(Boolean(find_to_userId.kyc_success) === false){
    //                     return res.status(200).send({
    //                         status: 101,
    //                         "msg": "you must kyc before receive 2KDG for lucky-spin-daily",
    //                     });
    //                 }

    //                 var lucky_spin_daily = find_to_userId.lucky_spin_daily;
    //                 if(lucky_spin_daily !== now_format) {
    //                     // gui 2 KDG Reward
    //                     await deposit_kdg_reward(to_id, 2);
    //                     await User.findByIdAndUpdate(to_id, {
    //                         lucky_spin_daily: now_format,
    //                     });

    //                     let result = await create_user_transaction(userId, from_id, to_id, type, "2", note);
    //                     let to_user = await User.findById(to_id)
    //                     to_user.user_transactions.push(result.data._id)
    //                     await to_user.save()
    //                     return res.status(200).send({
    //                         status: 1,
    //                         txId: result.data.txId,
    //                     });
    //                 } else {
    //                     return res.status(200).send({
    //                         status: 0,
    //                         msg: "user received kdg reward lucky daily",
    //                     });
    //                 }
    //             }
    //         }
    //         else if(type === "register-success") {
    //             if(from === "admin") {
    //                 if(find_to_userId.parent_user_id !== undefined && find_to_userId.parent_user_id !== null) {
    //                     await deposit_kdg_reward(find_to_userId.parent_user_id._id, 1);
    //                     let result = await create_user_transaction(userId, from_id, find_to_userId.parent_user_id._id, type, "1", note);
    //                     let to_user = await User.findById(find_to_userId.parent_user_id._id)
    //                     to_user.user_transactions.push(result.data._id)
    //                     await to_user.save()
    //                     return res.status(200).send({
    //                         status: 1,
    //                         txId: result.data.txId,
    //                     });
    //                 } else {
    //                     return res.status(200).send({
    //                         status: 0,
    //                         msg: "user haven't ref parent id",
    //                     });
    //                 }
    //             }
    //         }
    //         else if(type === "kyc-success") {
    //             if(from === "admin") {
    //                 var kyc_success = find_to_userId.kyc_success || false;
    //                 if(kyc_success === false) {
    //                     // gui 3 KDG Reward khi user kyc thanh cong
    //                     await deposit_kdg_reward(find_to_userId._id, 3);

    //                     let result2 = await create_user_transaction(userId, from_id, find_to_userId._id, type, "3", "RECEIVE 3 KDG THUS KYC SUCCESS");
    //                     let to_user2 = await User.findById(find_to_userId._id)
    //                     to_user2.user_transactions.push(result2.data._id)
    //                     await to_user2.save()

    //                     if(find_to_userId.parent_user_id !== undefined && find_to_userId.parent_user_id !== null) {
    //                         // gui 4 KDG Reward cho parent ref khi user kyc thanh cong
    //                         await deposit_kdg_reward(find_to_userId.parent_user_id._id, 5);

    //                         await User.findByIdAndUpdate(to_id, {
    //                             kyc_success: true,
    //                         });

    //                         let result = await create_user_transaction(userId, find_to_userId._id, find_to_userId.parent_user_id._id, type, "5", note);
    //                         let to_user = await User.findById(find_to_userId.parent_user_id._id)
    //                         to_user.user_transactions.push(result.data._id)
    //                         await to_user.save()

    //                         return res.status(200).send({
    //                             status: 1,
    //                             txId: result.data.txId,
    //                         });

    //                     } else {
    //                         return res.status(200).send({
    //                             status: 2,
    //                             msg: "kyc success, user haven't ref parent id",
    //                         });
    //                     }
    //                 } else {
    //                     return res.status(200).send({
    //                         status: 0,
    //                         msg: "user received kdg for kyc success!",
    //                     });
    //                 }
    //             }
    //         }
    //         else {
    //             return res.status(200).send({
    //                 status: 0,
    //                 err: 'no find type transaction'
    //             });
    //         }
    //     }
    //     catch(er){
    //         return res.status(200).send({
    //             status: 0,
    //             err: er,
    //         });
    //     }
    // });

    // create_user_transaction = async (_userId, _from, _to, _type, _value, _note) => {
    //     var new_doc = {
    //         userId: _userId,
    //         from: _from,
    //         to: _to,
    //         type: _type,
    //         value: _value,
    //         note: _note,
    //         txId: uuid.v4(),
    //         create_date: new Date(),
    //     }

    //     let new_transaction = await UserTransaction.create(new_doc);

    //     return {
    //         status: 1,
    //         data: new_transaction
    //     };
    // }

    // deposit_kdg_reward = async(user_id, value) => {
    //    let find_admin = await User.findOne({ email: 'admin' });
    //    let find_user = await User.findOne({ _id: user_id });

    //     if(find_admin !== null) {
    //         let current_kdg_reward_admin = find_admin.kdg_reward;
    //         let new_kdg_reward_admin = current_kdg_reward_admin - value;
    
    //         await User.findByIdAndUpdate(find_admin._id, {
    //             kdg_reward: new_kdg_reward_admin,
    //         });
            
    //         let current_kdg_reward_user = find_user.kdg_reward || 0;
    //         let new_kdg_reward_user = current_kdg_reward_user + value;

    //         await User.findByIdAndUpdate(find_user._id, {
    //             kdg_reward: new_kdg_reward_user,
    //         });

    //         return {
    //             status: 1,
    //             msg: "success",
    //         }
    //     }
    //     else {
    //         return {
    //             status: 0,
    //             err: 'no find admin'
    //         }
    //     }
    // }
}