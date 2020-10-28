const {Schema , model, Types} = require('mongoose')
const validator = require('validator')

const userCodeSchema = Schema({
    email : {type: String , required : true},
    code: {type: String, required: true}
})

userCodeSchema.index({ "lastModifiedDate": 1 }, { expireAfterSeconds: 180 })

module.exports = model('userCode', userCodeSchema)
