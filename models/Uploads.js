const {Schema , model, Types} = require('mongoose')

const uploadSchema = Schema({
    path : {type : String, required : true},
    user : {type : Types.ObjectId , ref : 'users'},
    create_date : {type : Date , default : new Date()}
})

module.exports = model('uploads', uploadSchema)

