
var http = require('http'),
	fs = require('fs'),
	express = require('express'),
	mode = (process.argv && process.argv[2]) || 'bae', // 运行模式
	config = (function() {
		// 确保配置文件存在
		try {
			return require(__dirname + '/config/' + mode);
		} catch (err) {
			throw new Error('Config file not found');
		}
	})(),
	app = express(),
	wxbase = require('./lib/wxbase/');

app.configure(function() {
	app.set('env', config.env);
	app.use(express.favicon());
	app.use(express.bodyParser({uploadDir: config.tmpDir}));
	app.use(require('./lib/rawbody'));
});

var reqList = [];
app.post(config.wxPath, function(req, res, next) {
	var reqXml = req.rawBody;
	reqList.push(reqXml);
	next();
});
app.get('/look', function(req, res, next) {
	res.send(reqList);
});
// 使用 wxbase
wxbase({
	app: app,
	wxPath: config.wxPath,
	wxToken: config.wxToken,
	wxHandler: require('./lib/my-wx-handler')()
});

app.use(express.static(config.publicDir));
http.createServer(app).on('error', function(err) {
	throw new Error('Port ' + config.port + ' occupied');
}).listen(config.port, function() {
	console.log('Listening on port ' + config.port);
});
