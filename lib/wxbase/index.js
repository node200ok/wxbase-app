
var wxParser = require('./parser'),
    wxValid = require('./valid');

module.exports = function(options) {
	var app = options.app,
		wxPath = options.wxPath,
        wxToken = options.wxToken,
		wxHandler = options.wxHandler,
        wxValidPost = options.wxValidPost;
    wxValid.init({
        wxToken: wxToken
    });

	app.get(wxPath, wxValid.valid);
    if (wxValidPost) {
        app.post(wxPath, wxValid.valid);
    }
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
