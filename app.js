
var http = require('http'),
	fs = require('fs'),
	express = require('express'),
	mode = (process.argv && process.argv[2]) || 'bae', // 运行模式
	config = (function() {
		var configFile = __dirname + '/config/' + mode + '.js';
		// 确保配置文件存在
		if (! fs.existsSync(configFile)) {
			throw new Error('Config file not found');
		}
		return require(configFile);
	})(),
	app = express(),
	wxbase = require('./lib/wxbase/');

app.configure(function() {
	app.set('env', config.env);
	app.use(express.favicon());
	app.use(express.bodyParser({uploadDir: config.tmpDir}));
	app.use(require('./lib/rawbody'));
});

// 使用 wxbase
wxbase({
	app: app,
	wxPath: config.wxPath,
	wxToken: config.wxToken,
	wxHandler: require('./lib/my-wx-handler')
});
app.use(express.static(config.publicDir))
http.createServer(app).on('error', function(err) {
	throw new Error('Port ' + config.port + ' occupied');
}).listen(config.port, function() {
	console.log('Listening on port ' + config.port);
});
