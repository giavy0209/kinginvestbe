const {Schema , model, Types, mongo} = require('mongoose')
const validator = require('validator')

const userSchema = Schema({
    email : {
        type : String ,
        index: true,
        unique: true,
        required : true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error("This is an Error with email!!!")
            }
        }
    },
    password : {
        type : String,
        required : true,
        trim: true
    },
    parent : {type : Types.ObjectId , ref : 'users' , required : true},
    childs : [{type : Types.ObjectId , ref : 'users', default:[]}],
    ref_code : {type : String , required : true, unique: true},
    kyc : {
        name : {type : String, default : ''},
        phone: {type : String, default : ''},
        birthday :{type : String, default : ''},
        id : {type : String, default : ''},
        images : [{
            type : Types.ObjectId,
            ref : 'uploads' ,
            default : []
        }],
        signal: {type: Boolean, default: false},
        last_date : {type : Date}
    },
    wallets : [{type : Types.ObjectId, ref : 'wallets', default : []}],
    points : {type : Number , default : 0},
    level : {type : Number , default : 0},
    transactions : [{type : Types.ObjectId , ref : 'transactions', default:[]}],
    invests : [{type : Types.ObjectId , ref : 'invests', default:[]}],
    isLock: {type: String, default: false},
    is2FA :{type: Boolean, default: false},
    google_authenticator_secrect_key: {type: String, default: ''},
    reinvest_balance: {type: Number, default:0},
    create_date : {type : Date , default : new Date()}
})
userSchema.path('kyc.images').validate(function (value) {
    if (value.length > 3) {
      throw new Error("Assigned person's size can't be greater than 10!");
    }
  });

module.exports = model('users', userSchema)
