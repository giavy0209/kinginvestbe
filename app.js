const fs = require('fs')
const http = require('http')
const path = require('path')
const VARIABLE = require(path.join(__dirname, './variable'))
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

mongoose.connect(
    VARIABLE.CONNECT_STRING,
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
require('./routes/userHelper')(router)

server.listen(VARIABLE.PORT, () => console.log('tao nghe tren port : ' + VARIABLE.PORT))
