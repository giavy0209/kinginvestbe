const fs = require('fs')
const http = require('http')
const path = require('path')
const VARIABLE = require(path.join(__dirname, './variable'))
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

mongoose.connect(
    VARIABLE.CONNECT_STRING2,
    {
        useNewUrlParser: true ,
        useUnifiedTopology: true,
        useFindAndModify : true
    }
).then(r =>console.log('connect roi nha dkm'))

const express = require('express')

const app = express()

const server = http.createServer(app)

const router = express.Router()

function requiremodels () {
    var dirmodel = fs.readdirSync('./models')
    dirmodel.forEach(model => require('./models/' + model))
}requiremodels()

app.use(router)
router.use(bodyParser.json());
router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("*", "*");
    next();
});

require('./routes/User')(router)
require('./routes/Upload')(router)
require('./routes/userHelper')(router)
require('./routes/securityRoutes')(router)
require('./routes/getInfoBlcRoutes')(router)
require('./routes/newRoutes')(router)
require('./routes/Invest')(router)
require('./routes/depositRoutes')(router)
require('./routes/withDrawRoutes')(router)
require('./routes/getHistoryTransaction')(router)
require('./routes/internalTransfer')(router)
require('./routes/payProfit')(router)
require('./routes/admin/configSystem')(router)
require('./routes/admin/lockUser')(router)

server.listen(VARIABLE.PORT, () => console.log('tao nghe tren port : ' + VARIABLE.PORT))
