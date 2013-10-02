
var request = require('request'),
	wxParser = require('../lib/wxbase/parser');

module.exports = function(options) {
	var hostUrl = options.hostUrl,
		wxPath = options.wxPath;
	
	return function(theRes) {
		var reqObj = {
			toUserName: 'aaa',
			fromUserName: 'ccc',
			createTime: new Date().getTime(),
			msgType: 'text',
			content: 'wo cao~'
		}, reqXml = wxParser.toXml(reqObj);
		request({
			method: 'post',
			url: hostUrl + wxPath,
			body: reqXml
		}, function(err, res, resXml) {
			var resObj = wxParser.toObj(resXml);
			theRes.send(resObj);
		});
	}
}
