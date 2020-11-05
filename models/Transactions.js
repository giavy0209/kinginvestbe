const {Schema , model, Types} = require('mongoose')

const transactionSchema = Schema({
    user : {type : Types.ObjectId , ref : 'user', required : true},
    value : {type : Number , required : true},
    type : {type : Number , required : true},
    from : {type : String , required : true},
    to : {type : String , required : true},
    coin: {type : Types.ObjectId , ref : 'coins', required : true},
    create_date : {type : Date , default : new Date()}
})

module.exports = model('transactions', transactionSchema)
