const {Schema , model, Types} = require('mongoose')

const uploadSchema = Schema({
    path : {type : String},
    user : {type : Types.ObjectId , ref : 'users'},
    types: {type: String, required: true},
    create_date : {type : Date ,  default : () => new Date()}
})

module.exports = model('uploads', uploadSchema)

