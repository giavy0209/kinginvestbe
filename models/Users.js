const {Schema , model, Types, mongo} = require('mongoose')

const userSchema = Schema({
    email : {type : String , required : true},
    password : {type : String, required : true},
    parent : {type : Types.ObjectId , ref : 'users' , required : true},
    childs : [{type : Types.ObjectId , ref : 'users', default:[]}],
    ref_code : {type : String , required : true, unique: true},
    kyc : {
        name : {type : String, default : ''},
        phone: {type : String, default : ''},
        birthday :{type : String, default : ''},
        id : {type : String, default : ''},
        images : [{type : Types.ObjectId, ref : 'uploads' , default : []}],
    },
    wallets : [{type : Types.ObjectId, ref : 'wallets', default : []}],
    points : {type : Number , default : 0},
    level : {type : Number , default : 0},
    transactions : [{type : Types.ObjectId , ref : 'transactions', default:[]}],
    invests : [{type : Types.ObjectId , ref : 'invests', default:[]}],
    create_date : {type : Date , default : new Date()}
})

module.exports = model('users', userSchema)
