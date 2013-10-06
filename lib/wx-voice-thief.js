
var fs = require('fs'),
	_ = require('underscore'),
	md5 = require('./md5'),
	Client = require('./client'),
	client = new Client('mp.weixin.qq.com');

var viewCount = 10, token, logined = false;

exports.init = function(wxAccount) {
	client.post('/cgi-bin/login?lang=zh_CN', {
		username : wxAccount.username,
		pwd : md5(wxAccount.password),
		imgcode : '',
		f : 'json'
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
			});
		if (! mediaItems.length) {
			callback(null);
		}
		
		var media = mediaItems[0];
		client.get('/cgi-bin/getvoicedata?msgid=' + media['id'] + '&fileid=&token=' + token + '&lang=zh_CN',
		{}, {}, function(err, res, buf) {
			callback(media, res, buf);
		});
	});
	return self;
}

