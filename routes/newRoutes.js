const mongoose = require('mongoose');
const path = require('path')
const VARIABLE = require(path.join(__dirname, '../variable'))
const lib_common = require(VARIABLE.LIBS_DIR+'/commons');
const auth_lib = require(VARIABLE.LIBS_DIR+'/auth');
const News = require(VARIABLE.MODELS_DIR + '/News')

var Auth = require(VARIABLE.AUTH_DIR + '/auth');
const response_express = require(VARIABLE.LIBS_DIR + '/responses').response_express

module.exports = (router) => {
    //get by slug ko phai by id
    router.get(`/get_by_id_news/:id`, async (req, res) => {
        const id = req.params.id

        try
        {
            let news = await News.findById(id)
            return response_express.success(res, news)
        }
        catch(er){
            return response_express.exception(res, er)
        }
    });

    router.get(`/news`, async (req, res) => {
        const { skip, take , search, language} = req.query;
        var _skip = parseInt(skip);
        var _take = parseInt(take)

        var query = {}

        //copy trắng trợn vkl

        if(search && search !== ''){
            query.$text = {$search : search}
        }

        if(language === 'vi'){
            query.thumbURL_vi = {$ne : null}
            query.title_vi = {$ne : null}
            query.meta_vi = {$ne : null}
            query.content_vi = {$ne : null}
        }

        if(language === 'en'){
            query.thumbURL_en = {$ne : null}
            query.title_en = {$ne : null}
            query.meta_en = {$ne : null}
            query.content_en = {$ne : null}
        }
        try
        {
            let news = await News.find(query, null, {skip: _skip, limit: _take}).sort({_id : -1});
            let total = await News.find(query).count();
  
            return res.status(200).send({
                status: 1,
                data: news,
                totalPost: total,
            });
        }
        catch(er){
            return res.status(200).send({
                status: 0,
                err: er,
            });
        }
    });

    // // router.get(`/news`, auth_controller.isAuthenticated, async (req, res) => {
    // //     const { skip, take , search} = req.query;
    // //     var _skip = parseInt(skip);
    // //     var _take = parseInt(take)

    // //     var query = {}

    // //     if(search && search !== ''){
    // //         query.$text = {$search : search}
    // //     }
    // //     try
    // //     {
    // //         let news = await News.find(query, null, {skip: _skip, limit: _take}).sort({_id : -1});
    // //         let total = await News.find(query).count();
  
    // //         return res.status(200).send({
    // //             status: 1,
    // //             data: news,
    // //             totalPost: total,
    // //         });
    // //     }
    // //     catch(er){
    // //         return res.status(200).send({
    // //             status: 0,
    // //             err: er,
    // //         });
    // //     }
    // // });

    // router.get(`/news/search/:text`, auth_controller.isAuthenticated,  async (req, res) => {

    //     const { text } = req.params;
    //     // console.log("search")
    //     // console.log(text);

    //     // var page = req.params.page
    //     // var sortType = req.params.sortType
    //     // var category = req.body.CategoryForFilter
    //    // var Search = text; //req.body.Search
    //     var queryProduct ={}

    //     // if(category.length > 0){
    //     //     queryProduct.category =  { $all: category }
    //     // }

    //     if(text && text !== ''){
    //         queryProduct.$text = { $search: text }
    //     }
        

    //     //var totalItem = await Product.countDocuments(queryProduct)
    //     //var skip = ITEM_PER_PAGE * (page - 1)
        
    //     var find_news = await News.
    //     find(queryProduct)
    //     .limit(10)
    //     .skip(0)

    //     var totalPost = await News.find(queryProduct)
    //     //let find_news = await News.find({$text: {$search: text}});
    //     //let total = await News.find({$text: {$search: text}}).count();

    //     return res.status(200).send({
    //         status: 0,
    //         data: find_news,
    //         totalPost, //total,
    //     });
    // });

    router.post(`/news`, Auth.isAdminAuthenticated, async (req, res) => {
        let missField = lib_common.checkMissParams(res, req.body, ["title", "slug","content","meta_des"])
        if (missField){
            return;
        } 
        if(typeof req.body.title !== 'object' || typeof req.body.content !== 'object' || typeof req.body.meta_des !== 'object'){
            return res.send('input format wrong!');
        }

        try{
            let data = await News.create(req.body)
            return response_express.success(res,data)
        }
        catch(er){
            return response_express.exception(res,er)
        }   
    });

    router.put(`/news/:id`, Auth.isAdminAuthenticated, async (req, res) => {
        try
        {
            var {id} = req.params
            const updates = Object.keys(req.body)
            const allowedUpdates = ['title','slug','content','meta_des']
            req.body.create_date = new Date();

            let data = await News.findById(id);
            updates.forEach(_update=>{
                console.log(data[_update]);
                if(allowedUpdates.includes(_update)){
                    data[_update] = req.body[_update]
                }
            })
            await data.save()

            return response_express.success(res, data)
        }
        catch(er){
            return response_express.exception(res, er)
        }
    });

    router.delete(`/news/:id`, Auth.isAdminAuthenticated, async (req, res) => {
        var {id} = req.params
        try
        {

            let data = await News.findByIdAndDelete(id);

            return response_express.success(res, data)
        }
        catch(er){
            return response_express.exception(res, er)
        }
    });
}