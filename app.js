const http = require('http')
const path = require('path')
const VARIABLE = require(path.join(__dirname, './variable'))
const mongoose = require('mongoose')

mongoose.connect(
    `mongodb://${VARIABLE.MONGO_IP}:${VARIABLE.MONGO_PORT}/${VARIABLE.MONGO_DB_NAME}`,
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

app.use(router)
router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "kingdomgame.");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("*", "*");
    next();
});

server.listen(VARIABLE.PORT, () => console.log('tao nghe tren port : ' + VARIABLE.PORT))
