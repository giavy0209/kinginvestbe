const path = require('path')
var jwt = require('jsonwebtoken')
const VARIABLE = require(path.join(__dirname, '../variable'))
const User = require(VARIABLE.MODELS_DIR + '/Users')

var response_express = require(VARIABLE.LIBS_DIR + '/responses').response_express

function findMissParams(obj, checkProps) {
	if (!Array.isArray(checkProps)) {
		checkProps = [checkProps];
	}

	var missProps = [];

	checkProps.forEach(prop=> {
		if (!Object.keys(obj).includes(prop)) {
			missProps.push(prop);
		}
	})

	return missProps;
};

function checkMissParams(res, obj, checkProps) {
	var missProps = findMissParams(obj, checkProps);
	if (missProps[0]) {
		response_express.exception(res, "Miss some params: " + missProps.toString())
		return true;
	}
	return false;
};

function createToken(user, expire) {
	return jwt.sign(user, VARIABLE.secret, {
		expiresIn: expire
	});
}

module.exports = {
	findMissParams,
	checkMissParams,
	createToken

}