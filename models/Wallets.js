const {Schema , model, Types} = require('mongoose')

const walletSchema = Schema({
    user : {type : Types.ObjectId , ref : 'users'},
    chain : {type : Types.ObjectId , ref : 'chain'},
    balances : [{type : Types.ObjectId , ref : 'balances', default: 0}],
    address : {type : String , required : true},
    private_key : {type : String , required : true},
})

module.exports = model('wallets', walletSchema)
