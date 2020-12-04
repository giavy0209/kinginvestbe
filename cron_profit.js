var CronJob = require('cron').CronJob;
const axios = require('axios')
const mongoose = require('mongoose')

const VARIABLE = require('./variable')
console.log(VARIABLE.MODELS_DIR + '/Invests');
const Invest = require(VARIABLE.MODELS_DIR + '/Invests')

mongoose.connect(
    VARIABLE.CONNECT_STRING2,
    {
        useNewUrlParser: true ,
        useUnifiedTopology: true,   
        useFindAndModify : true
    }
).then(r =>console.log('connect roi nha dkm'))


async function payEveryday(){
    const invests = await Invest.find({
        isClosed: false
    })
    console.log('Tổng số Invest trong toàn hệ thống: ',invests.length);
    for (let index = 0; index < invests.length; index++) {
        await axios.post((VARIABLE.DOMAIN_LOCAL+`/profit_everyday?idIV=${invests[index]._id}&&idMG=${index}`)
        // {
        //     headers: { authorization: "Bearer " + token }
        // }
        ) 
    }
}
// payEveryday()

console.log('Before job instantiation');
const job = new CronJob('00 00 08 * * *', function() {
	const d = new Date();
    console.log('onTick:', d);
    payEveryday()
}, null, true, 'Asia/Ho_Chi_Minh');
console.log('After job instantiation');
job.start();