
var fs = require('fs'),
    crypto = require('crypto'),
	_ = require('underscore'),
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
	getMessagePage(function(err, res, buf) {
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
    if (wxAccount.cookie && wxAccount.token) {
        client.setCookie(wxAccount.cookie);
        token = wxAccount.token;
        getMessagePage(function(err, res, buf) {
            if (client.cookie['slave_user'] === 'EXPIRED') {    // 过期
                throw new Error('Cookie Token Incorrect');
            }
        });
        return;
    }
	client.post('/cgi-bin/login?lang=zh_CN', {
		username : wxAccount.username,
		pwd : md5(wxAccount.password),
		imgcode : '',
		f : 'json'
	}, {
		'Referer': 'https://mp.weixin.qq.com/'
	}, function(err, res, buf) {
		var resTxt = buf.toString(),
			resObj = JSON.parse(resTxt),
			errCode = resObj['ErrCode'];
		if (! _.contains([0, 65201, 65202], errCode)) {
            if (errCode === -6) {
                throw new Error('VerifyCode Needed - Try Emergent Way');
            } else {
                throw new Error('Login Info Incorrect');
            }
		} else {
			homeUrl = resObj['ErrMsg'];
			token = homeUrl.match(/token=(.+)$/)[1];
		}
	});
}
function getMessagePage(callback) {
    client.get('/cgi-bin/message?t=message/list&count='
        + viewCount +'&day=7&token='+ token +'&lang=zh_CN',	// day 7: today
    {}, {}, callback);
}
function md5(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}

