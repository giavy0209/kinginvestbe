const {Types} = require('mongoose')
const Users = require('../models/Users')
const VARIABLE = require(path.join(__dirname, '../variable'))
const lib_common = require(VARIABLE.LIBS_DIR+'/commons');

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

        let missField = lib_common.checkMissParams(res, req.body, ["email", "password", "ref_code"])
        if (missField){
            return;
        } 

        const find_parant = await Users.findOne({ref_code : req.body.ref_code})

        req.body.parent = find_parant._id

        lib_password.cryptPassword(req.body.user.password)
        .then(passwordHash => {
            delete req.body.user.password;
            req.body.user.password_hash = passwordHash;
            req.body.user.privateKey = sha256(config.secret + req.body.user.email)
            let wallet = new ethers.Wallet(req.body.user.privateKey)
            req.body.user.addressEthereum = wallet.address
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