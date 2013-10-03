
var wxParser = require('./parser');

module.exports = function(options) {
	var app = options.app,
		wxPath = options.wxPath,
		wxValid = require('./valid')(options.wxToken),
		wxHandler = options.wxHandler;
	
	app.get(wxPath, function(req, res, next) {
		req.query['echostr'] ? wxValid(req, res) : next();
	});
	app.post(wxPath, function(req, res, next) {
		var reqXml = req.rawBody,
			reqObj = wxParser.toObj(reqXml);
		wxHandler(reqObj, function(resObj) {
			var resXml = wxParser.toXml(resObj);
	   		res.send(resXml);
		});
	});
}
