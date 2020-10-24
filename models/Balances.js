const {Schema , model, Types} = require('mongoose')

const balanceSchema = Schema({
    user : {type : Types.ObjectId , ref : 'user'},
    chain : {type : Types.ObjectId , ref : 'chain'},
    wallet : {type : Types.ObjectId , ref : 'wallet'},
    coins : {type : Types.ObjectId , ref : 'coins'},
    balance : {type : Types.ObjectId , default : 0}
})

module.exports = model('balances', balanceSchema)

