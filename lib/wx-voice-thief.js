
var fs = require('fs'),
	_ = require('underscore'),
	md5 = require('./md5'),
	Client = require('./client'),
	client = new Client('mp.weixin.qq.com');

var format = 'mp3', viewCount = 20,
	voiceCount = 30,
	voiceDir, token, logined = false;

exports.init = function(wxAccount, voiceDir_) {
	voiceDir = voiceDir_;
	// 确保目录存在
	fs.existsSync(voiceDir) || fs.mkdirSync(voiceDir);
	
	client.post('/cgi-bin/login?lang=zh_CN', {
		username : wxAccount.username,
		pwd : md5(wxAccount.password),
		imgcode : "",
		f : "json"
	}, {
		'Referer' : 'https://mp.weixin.qq.com/'
	}, function(err, res, buf) {
		var resTxt = buf.toString(),
			resObj = JSON.parse(resTxt),
			errCode = resObj['ErrCode'];

		if (! _.contains([0, 65201, 65202], errCode)) {
			throw new Error('Wx public account login fail');
		} else {
			homeUrl = resObj['ErrMsg'];
			token = homeUrl.match(/token=(.+)$/)[1];
			logined = true;
		}
	});
	
	// 确保session不断开
	setInterval(function() {
		client.get('/', {}, {}, null);
	}, 1000 * 60 * 15);	// 15min
	return this;
}
exports.steal = function(callback) {
	var self = this;
	if (! logined) {
		callback(null);
		return self;
	}
	
	client.get('/cgi-bin/message?t=message/list&token=' + token + '&count='+ viewCount +'&day=7',	// day 7: today
	{}, {}, function(err, res, buf) {
		var html = buf.toString(),
			listStr = html.match(/list : \((\{.+\})\)/)[1],
			items = JSON.parse(listStr).msg_item,
			mediaItems = _.where(items, {
				type : 3	// 语音
			}),
			ids = _.pluck(mediaItems, 'id');
		if (! ids.length) {
			callback(null);
			return self;
		}
		// 确保最新的语音全部保存
		_.each(ids, function(id, i) {
			client.get('/cgi-bin/getvoicedata?msgid=' + id + '&fileid=&token=' + token + '&lang=zh_CN',
			{}, {}, function(err, res, buf) {
				var file = id + '.' + format,
					filePath = voiceDir + '/' +  file;
				if (i === 0) {
					callback(file);
				}
				fs.readdir(voiceDir, function(err, files) {
					if (! _.contains(files, file)) {	// not exists
						if (files.length >= voiceCount) {	// 删除较旧的语音，维持总数
							_.each(files.sort(function(a, b) {	// 逆序
								return parseInt(b) - parseInt(a);
							}).slice(voiceCount - 1), function(val) {
								fs.unlinkSync(voiceDir + '/' + val);
								console.log('deleted voice: ' + val);
							});
						}
						fs.writeFileSync(filePath, buf);
						console.log('saved voice: ' + id);
					}
				});
			});
		});
	});
	return self;
}
