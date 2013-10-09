
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
        try {
            var error = new Error(),
                reqXml = req.rawBody,
                reqObj = wxParser.toObj(reqXml);
            if (! reqObj) {
                throw error;
            }
            var resObj = {
                toUserName: reqObj.fromUserName,
                fromUserName: reqObj.toUserName,
                createTime: new Date().getTime()
            }, subHandler;
            var error = new Error(),
                msgType = reqObj.msgType;
            subHandler = wxHandler.subHandlers[msgType === 'event' ? reqObj.event : msgType]
                || wxHandler.subHandlers['DEFAULT'];
            if (! subHandler) {
                throw new Error();
            }
            subHandler(reqObj, resObj, function(resObj) {
                var resXml = wxParser.toXml(resObj);
                res.send(resXml);
            });
        } catch (err) {
            res.send('');
        }
	});
}
