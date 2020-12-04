const {Schema , model, Types} = require('mongoose')

const investSchema = Schema({
    user : {type : Types.ObjectId , ref : 'users', required : true},
    value : {type : Number , required : true},
    current_profit : {type : Number , default : 0},
    max_profit : {
        type : Number,
        required : true
    },
    isActive : {type : Boolean , default : false},
    isClosed: {type: Boolean, default: false},
    transaction : [{type : Types.ObjectId , ref : 'transactions' , default : [] }],
    create_date : {type : Date , default : new Date()},
})

module.exports = model('invests', investSchema)
