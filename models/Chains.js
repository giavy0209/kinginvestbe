const {Schema , model, Types} = require('mongoose')

const chainSchema = Schema({
    name : {type : String , required : true},
    symbol : {type : String , required : true},
    coins : [{type : Types.ObjectId , ref : 'coins'}],
    logo : {type : Types.ObjectId , ref : 'uploads'},
})

module.exports = model('chains', chainSchema)