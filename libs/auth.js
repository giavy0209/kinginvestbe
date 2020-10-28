const path = require('path')
const jwt = require('jsonwebtoken')
const VARIABLE = require(path.join(__dirname, '../variable'))
const isAdminAuthenticated = function(req) {
    // console.log("req.headers", req.headers)
    if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        var jwtToken =  req.headers.authorization.split(' ')[1];
        var payload = jwt.verify(jwtToken, VARIABLE.secret);
        if (payload.email === VARIABLE.ADMIN_EMAIL) {
            return true
        } else {
            // console.log('sai');
            console.log(payload.email === VARIABLE.ADMIN_EMAIL);
            return false
        }
    } else {
        return false
    }
};

module.exports = {
    isAdminAuthenticated,
}