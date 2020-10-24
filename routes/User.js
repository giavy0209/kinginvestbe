const {Types} = require('mongoose')
const Users = require('../models/Users')

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
        const {
            id ,
            ref_code,
            email,
            password
        } = req.body
        if(!ref_code || ref_code === '')  {
            return res.send({
                status : 0
            })
        }


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