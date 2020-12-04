const path = require('path')

const VARIABLE = require(path.join(__dirname, '../../variable'))
const response_express = require(VARIABLE.LIBS_DIR + '/responses').response_express
const lib_common = require(VARIABLE.LIBS_DIR+'/commons');
const Auth = require(VARIABLE.AUTH_DIR + '/auth')
const { _transfer, isMaxProfit, checkActivateDate, checkMissParams} = require('../../libs/commons')

const User = require(VARIABLE.MODELS_DIR + '/Users')

module.exports = (router)=>{
    router.post('/lockUser',Auth.isAdminAuthenticated,async (req, res)=>{
        try{
            let missField = checkMissParams(res, req.body, ["idUser"])
            if (missField){
                console.log("Miss param at Create Field");
                return;
            }
            const {idUser} = req.body
            const user = await User.findById(idUser)
            if(user.isLock === 'true' || !user){
                return response_express.exception(res, 'can not lock this user')
            }
            user.isLock = 'true'
            await user.save()
            return response_express.success(res,'ok')
        }catch(e){
            return response_express.exception(res, 'common error')
        }
    })
    router.post('/lockFunction',Auth.isAdminAuthenticated,async (req, res)=>{
        try{
            let missField = checkMissParams(res, req.body, ["idUser"])
            if (missField){
                console.log("Miss param at Create Field");
                return;
            }
            if(Object.keys(req.query) === []){
                return response_express.exception(res, 'nothing to lock!')
            }
            const allowedLock = ['widthdraw', 'deposit']

            Object.keys(req.query).filter(key=>{
                return allowedLock.includes(key)
            })

            const {idUser} = req.body

            const user = await User.findById(idUser)
            if(!user || user.isLock === 'true'){
                return response_express.exception(res, 'can not lock this user')
            }
            user.listLockFunction = Object.keys(req.query) 
            await user.save()
            return response_express.success(res,'ok')
        }catch(e){
            return response_express.exception(res, 'common error')
        }
    })
}
