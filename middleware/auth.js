const jwt = require('jsonwebtoken')
const path = require('path')
const VARIABLE = require(path.join(__dirname, '../variable'))
const User = require(VARIABLE.MODELS_DIR + '/Users')
const response = require(VARIABLE.LIBS_DIR + '/responses')

exports.expressMiddleware = (req, res, next) => {
    let token = req.headers.authorization.split(' ')[1]
    if(token){
        jwt.verify(token, VARIABLE.secret, async (err, decoded) => {
            if(err)
                return response.response_express.exception(res, "Loi o day")
            req.token_info = decoded;
            const user = await User.findById(req.token_info._id)
            if(!user || user.isLock === true){
                return response.response_express.exception(res, "Loi o day 2")
            }
            next();
        });
    }else{
        return response.response_express.exception(res, "KDG in your eyes", 403);
    }
}

exports.socketMiddleware = (socket, next) => {
    let token = socket.handshake.query.token;
    if(token === undefined || token === null){
        next(new Error('No token provided.'));
    }else{
        jwt.verify(token, VARIABLE.secret, (err, decoded) => {
            if(err){
                return(err);
            }
            socket.handshake.decoded_token = decoded;
        });
        next();
    }
}

exports.isAdminAuthenticated = function(req, res, next) {
    // console.log("req.headers", req.headers)
    if (req.headers &&
        req.headers.authorization &&
        req.headers.authorization.split(' ')[0] === 'Bearer') {

        var jwtToken =  req.headers.authorization.split(' ')[1];
        // console.log("jwtToken", jwtToken)
        // console.log("config.jwtSecret", config.jwt_secret)
        jwt.verify(jwtToken, VARIABLE.secret, function(err, payload) {
            // console.log("err", err)
            // console.log("payload", payload)
            if (err) {
                res.status(401).json({message: 'Unauthorized user!'});
            } else {
                // console.log('decoder: ' + payload.email);
                // if is admin
                if (payload.email === "admin") {
                   // req.user = user;
                    next();
                } else {
                    res.status(401).json({ message: 'Unauthorized user!' });
                }
            }
        });
    } else {
        res.status(401).json({ message: 'Unauthorized user!' });
    }
};