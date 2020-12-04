const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Users = require('../models/Users')
const VARIABLE = require('../variable')
const Upload = require(VARIABLE.MODELS_DIR + '/Uploads')
const User = require(VARIABLE.MODELS_DIR + '/Users')
const Auth = require(VARIABLE.AUTH_DIR + '/auth')
const shortid= require('shortid')
const response_express = require(VARIABLE.LIBS_DIR + '/responses').response_express

module.exports = async router =>{
    const upload = multer({
        dest: './public/kyc_img',
        limits:{
            fileSize: 2000000
        },
        fileFilter(req, file, cb) {
            if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
                return cb(new Error('Please upoad only jpg, jepg,png'))
            }
            let filename = file.originalname;
            cb(null, filename);
        }
    })
    router.post('/upload_kyc_img',Auth.expressMiddleware, upload.single('kyc_img'),async(req, res)=>{
        // const buffer = await sharp(req.file.buffer).resize({width:350, height:350}).png().toBuffer()
        // if(err) console.log('upload err ' , err)
        var file = req.file
        var ex = path.extname(file.originalname)
        var img = new Upload({
            user:req.token_info._id,
            types: ex
        })
        //chưa use public mà truyền vào folder public thì ai lấy được???
        img.path = '/public/kyc_img/' + img._id + ex
        img.save()
        var user = await Users.findById(req.token_info._id)
        if(user.kyc.images.length >= 3){
            return response_express.exception(res,'Thua anh')
        }
        user.kyc.images.push(img._id)
        user.save()
        console.log(file.filename);
        fs.renameSync(path.join(__dirname,'../public/kyc_img',file.filename) , path.join(__dirname,'../public/kyc_img',img._id + ex))
        // var upload_id = img._id
        
        // fs.renameSync(path.join(__dirname, `../public/${file.originalname}`),path.join(__dirname, `../public/uploads/${img._id + ex}`))
            
        return response_express.success(res, {msg:'success', file: img})
    }, (error, req, res, next) =>{
        return response_express.exception(res,{error: error.message} )
    })

    router.get('/upload',Auth.expressMiddleware, async (req,res)=>{
        // const type = req.query.type
        // if(!type) return res.send({msg: 'Không có type'})

        try {
            const user = await Users.findById(req.token_info._id)
            .populate({
                path: 'kyc.images'
            })
            return response_express.success(res, {images: user.kyc.images})
        } catch (error) {
            console.log('get_uploads err', error);
        }
    })

    router.get('/upload_admin',Auth.isAdminAuthenticated, async (req,res)=>{
        // const type = req.query.type
        // if(!type) return res.send({msg: 'Không có type'})

        try {
            const files = await Upload.find({})
            const totalItem = await Upload.countDocuments({})
            return response_express.success(res, {listImage: files,itemPerPage: 50, totalItem})
        } catch (error) {
            console.log('get_uploads err', error);
        }
    })

    router.delete('/upload_admin',Auth.isAdminAuthenticated, async (req,res)=>{
        // const type = req.query.type
        // if(!type) return res.send({msg: 'Không có type'})
        //delete cái đéo gì ở đây ???
        try {
            const files = await Upload.find({})
            const totalItem = await Upload.countDocuments({})
            return response_express.success(res, {listImage: files,itemPerPage: 50, totalItem})
        } catch (error) {
            console.log('get_uploads err', error);
        }
    })
    router.delete('/upload', Auth.isAdminOrUserAuthenticated, async (req, res) => {
        const file = req.query.file
        if(!file) return res.send({msg: 'Chưa có file'})
        try {
            await Upload.findOneAndDelete({path: file})
            fs.unlinkSync(path.join(__dirname,'../public/kyc_img' , file))
            return response_express.success(res,{msg: 'success', deletedFile: file})
        } catch (error) {
            console.log('delete_uploads err', error);
        }
    })
}
