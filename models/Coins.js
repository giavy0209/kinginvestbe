const {Schema , model, Types} = require('mongoose')

const coinSchema = Schema({
    name : {type : String , required : true},
    symbol : {type : String , required : true},
    chains : {type : Types.ObjectId , ref : 'chains'},
    logo : {type : Types.ObjectId , ref : 'uploads'}
})

module.exports = model('coins', coinSchema)