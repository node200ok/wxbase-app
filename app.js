
var http = require('http'),
	fs = require('fs'),
	_ = require('underscore'),
	express = require('express'),
	mode = (process.argv && process.argv[2]) || 'bae', // 运行模式
	config = require('./config/')(mode),
	app = express(),
	wxbase = require('./lib/wxbase/');

app.configure(function() {
	_.each([config.publicDir, config.voiceDir], function(val) {
		fs.existsSync(val) || fs.mkdir(val);
	});
	
	app.set('env', config.env);
	app.use(express.favicon());
	app.use(express.bodyParser({uploadDir: config.tmpDir}));
	app.use(require('./lib/rawbody'));
});

// 查看请求列表
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
