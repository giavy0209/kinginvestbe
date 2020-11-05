const VARIABLE = require('../variable')
const Auth = require(VARIABLE.AUTH_DIR + '/auth')
const twoFactor = require('node-2fa');
const mongoose = require('mongoose')
const User = require('../models/Users')
const lib_password = require(VARIABLE.LIBS_DIR + '/password');
const response_express = require(VARIABLE.LIBS_DIR + '/responses').response_express

module.exports = router =>{
    router.post('/create_2fa',Auth.expressMiddleware,async(req, res)=>{
        var user = await User.findById(req.token_info._id)
        if(!user){
            return response_express.exception(res,'No User!')
        }
        var newSecret = twoFactor.generateSecret({name: user.email});

        if(user.google_authenticator_secrect_key !== '') {
            return response_express.success(res, {faSecret: user.google_authenticator_secrect_key})
        } else {
            user.google_authenticator_secrect_key = newSecret.secret
            user.save()

            return response_express.success(res,{faSecret: newSecret.secret })
        }

    })

    router.post(`/verify_2fa`, Auth.expressMiddleware, async (req, res) => {
        const { code } = req.body;
        let find_user = await User.findOne({ _id: req.token_info._id });
        console.log(find_user);
        if(find_user) {
            const authented = twoFactor.verifyToken(find_user.google_authenticator_secrect_key, code)
            if(authented!==null && authented.delta === 0) {
                await User.findByIdAndUpdate(find_user._id, {
                    is2FA: true
                });
                
                return response_express.success(res, {msg:'verify 2fa success'})
            } else {
                return response_express.exception(res, {msg:'verify 2fa fail'})
            }
        } else {
            return response_express.exception(res, 'no find user')
        }
    });

    router.post(`/disable_2fa`, Auth.expressMiddleware, async (req, res) => {
        const {code, password } = req.body;
        let find_user = await User.findById(req.token_info._id);
        if(find_user) {
            let hash_password = find_user.password;
            lib_password.comparePassword(password, hash_password).then(async function(result) {
                if(result) {
                    const authented = twoFactor.verifyToken(find_user.google_authenticator_secrect_key, code)
                    console.log(authented);
                    if(authented !== null && authented.delta === 0) {
                        
                        find_user.is2FA = false,
                        find_user.google_authenticator_secrect_key= undefined
                        find_user.save()
                        return response_express.success(res,'disable 2fa success')
                    } else {
                        return response_express.exception(res,'disable 2fa fail')
                    }
                } else {
                    return response_express.exception(res,'wrong password')
                }
            });
        } else {
            return response_express.exception(res,'no find user')
        }
    });

}