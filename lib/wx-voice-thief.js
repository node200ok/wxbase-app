
var fs = require('fs'),
    crypto = require('crypto'),
	_ = require('underscore'),
	Client = require('./client'),
	client = new Client('mp.weixin.qq.com'),
    viewCount = 10,
    token;

exports.init = function(options) {
    var wxAccount = options.wxAccount;
	login(wxAccount, true);
	// 保持登录状态，token应会相同
	setInterval(function() {
		login(wxAccount);
	}, 1000 * 60 * 15);	// 15min
	return this;
}
exports.steal = function(callback) {
	var self = this;
	getMsgItems(function(err, msgItems) {
        if (err) {
            callback(err);
            return;
        }
        var mediaItems = _.where(msgItems, {
            type : 3	// 语音
        });
        if (! mediaItems.length) {
            callback(new Error('No Recent Media'));
        }
        var media = mediaItems[0];
        client.get('/cgi-bin/getvoicedata?msgid=' + media['id'] + '&fileid=&token=' + token + '&lang=zh_CN',
        {}, {}, function(err, res, buf) {
            media['data'] = buf;
            callback(null, media);
        });
	});
	return self;
}

function login(wxAccount, firstTime) {
    if (firstTime && wxAccount.cookie && wxAccount.token) {
        client.setCookie(wxAccount.cookie);
        token = wxAccount.token;
        getMsgItems(function(err, msgItems) {
            if (err) {
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
function getMsgItems(callback) {
    client.get('/cgi-bin/message?t=message/list&count='
        + viewCount +'&day=7&token='+ token +'&lang=zh_CN',	// day 7: today
    {}, {}, function(err, res, buf) {
        try {
            var html = buf.toString(),
                listJson = html.match(/list : \((\{.+\})\)/)[1],
                msgItems = JSON.parse(listJson).msg_item;
            callback(null, msgItems);
        } catch (err) {
            callback(new Error('Not Yet Login'));
        }
    });
}
function md5(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}

