const {Types} = require('mongoose')
const Users = require('../models/Users')
const VARIABLE = require(path.join(__dirname, '../variable'))
const lib_common = require(VARIABLE.LIBS_DIR+'/commons');
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
        let missField = lib_common.checkMissParams(res, req.body, ["email", "password", "parent", "ref_code"])
        if (missField){
            return;
        } 

        lib_password.cryptPassword(req.body.password)
        .then(passwordHash => {
            delete req.body.password;
            req.body.password_hash = passwordHash;
            req.body.privateKey = sha256(VARIABLE.secret + req.body.email)
            let wallet = new ethers.Wallet(req.body.privateKey)
            req.body.addressEthereum = wallet.address
            // console.log(req.body.user)
            return User.create(req.body.user);
        })
        .then(async (user) => {
            // console.log(config.ownerSecretKey)
            // let a = await User.findOne({privateKey: config.ownerSecretKey})
            // console.log("sdfadsfadfasdfads")
            // console.log(a)
            await Users.findOneAndUpdate({ privateKey: config.ownerSecretKey }, { $push: { validateUser: user.addressEthereum } }).exec()
            response_express.success(res);
        })
        .catch(err => {
            response_express.exception(res, 'error');
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