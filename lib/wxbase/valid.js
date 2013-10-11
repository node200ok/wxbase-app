
var crypto = require('crypto'),
	wxToken;

exports.init = function(options) {
	wxToken = options.wxToken;
}
exports.valid = function(req, res, next) {
	if (! check(req)) {
		res.send('');
	} else {
		var echoStr = req.query['echostr'];
		if (echoStr) {
			res.send(echoStr);
		} else {
			next();
		}
	}
}

function check(req) {
	var signature = req.query['signature'],
		timestamp = req.query['timestamp'],
		nonce = req.query['nonce'];
	var tmpStr = [wxToken, timestamp, nonce].sort().join('');
	tmpStr = sha1( tmpStr );
	return tmpStr === signature;
}
function sha1(str){
	return crypto.createHash('sha1').update(str).digest('hex');
}

