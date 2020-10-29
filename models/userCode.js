const {Schema , model, Types} = require('mongoose')
const validator = require('validator')

const userCodeSchema = Schema({
    email : {type: String , required : true},
    code: {type: String, required: true},
    types: {type: Number, required: true},
    date : {type : Date, default : new Date()}
})

userCodeSchema.index({ "date": 1 }, { expireAfterSeconds: 10 })

module.exports = model('userCode', userCodeSchema)
