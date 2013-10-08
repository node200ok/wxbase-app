
var fs = require('fs'),
	_ = require('underscore'),
	md5 = require('./md5'),
	Client = require('./client'),
	client = new Client('mp.weixin.qq.com');

var viewCount = 10, token;

exports.init = function(wxAccount) {
	login(wxAccount);
	// 保持登录状态，token应会相同
	setInterval(function() {
		login(wxAccount);
	}, 1000 * 60 * 15);	// 15min
	return this;
}
exports.steal = function(callback) {
	var self = this;
	client.get('/cgi-bin/message?t=message/list&count='
		+ viewCount +'&day=7&token='+ token +'&lang=zh_CN',	// day 7: today
	{}, {}, function(err, res, buf) {
        try {
            var mediaItems;
            try {
                var html = buf.toString(),
                    listStr = html.match(/list : \((\{.+\})\)/)[1],
                    items = JSON.parse(listStr).msg_item;
                mediaItems = _.where(items, {
                    type : 3	// 语音
                });
            } catch (err) {
                throw new Error('HTML Fetching Error');
            }
            if (! mediaItems.length) {
                throw new Error('No Recent Media');
            }
            var media = mediaItems[0];
            client.get('/cgi-bin/getvoicedata?msgid=' + media['id'] + '&fileid=&token=' + token + '&lang=zh_CN',
            {}, {}, function(err, res, buf) {
                media['data'] = buf;
                callback(null, media);
            });
        } catch(err) {
            callback(err);
        }
	});
	return self;
}

function login(wxAccount) {
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
		}
	});
}

