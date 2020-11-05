const {Schema , model, Types} = require('mongoose')

const newSchema = Schema({
    title : {
        vi: {
            type : String,
            required : true,
            trim:true,
            minlength: 1
        },
        en: {
            type : String,
            required : true,
            trim:true,
            minlength: 1
        }
    },
    slug : {
        type : String,
        required : true
    },
    content : {
        vi: {
            type : String,
            required : true
        },
        en: {
            type : String,
            required : true
        }
    },
    meta_des : {
        vi: {
            type : String,
            required : true
        },
        en: {
            type : String,
            required : true
        }
    },
    create_date: {
        type : Date , default : new Date()
    }
})

module.exports = model('news', newSchema)