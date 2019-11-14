const moment = require('moment');
const jwt = require('jwt-simple');
const connection = require('../connection.json');

//
// Encode (from username to token)
//
function encodeToken(userName) {
	const payload = {
		exp: moment().add(10, 'days').unix(),
		iat: moment().unix(),
		sub: userName
	};
	return jwt.encode(payload, connection.secretKey);
}

//
// Decode (from token to username)
//
function decodeToken(token, cb) {
	try {
		const payload = jwt.decode(token, connection.secretKey);

		// Check if the token has expired
		if (moment().unix() > payload.exp) {
			cb(new Error('token_has_expired'));
		} else {
			cb(null, payload);
		}
	} catch (err) {
		cb(err, null);
	}
}

module.exports = {
	encodeToken,
	decodeToken
};
