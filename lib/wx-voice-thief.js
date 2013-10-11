
var fs = require('fs'),
	crypto = require('crypto'),
	_ = require('underscore'),
	Client = require('./client'),
	client = new Client('mp.weixin.qq.com'),
	viewCount = 15,
	token,
	lastMediaId;

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
	getMsgList(function(err, msgList) {
		if (err) {
			callback(new Error('Getting MsgList Error'));
			return;
		}
		var mediaList = _.where(msgList, {
				type : 3	// 语音
			});
		if (! mediaList.length) {
			callback(new Error('Getting MediaList Error'));
			return;
		}
		var media = getCurrentMedia(mediaList, lastMediaId);
        if (! media) {
            callback(new Error('Not Yet Current Media'));
            return;
        }

		lastMediaId = media['id'];
		client.get('/cgi-bin/getvoicedata?msgid=' + media['id'] + '&fileid=&token=' + token + '&lang=zh_CN',
		{}, {}, function(err, res, buf) {
			media['data'] = buf;
			callback(null, media);
		});
	});
	return self;
}

function getCurrentMedia(mediaList, lastMediaId) {
    var mediaIds = _.pluck(mediaList, 'id'), mediaId;
	if (! lastMediaId) {
		mediaId = mediaIds[0];
	} else {
		var index = _.lastIndexOf(mediaIds, lastMediaId);
		if (index === -1) {
			mediaId = _.last(mediaIds);
		} else if (index === 0) {
			return null;
		} else {
			mediaId = mediaIds[index - 1];
		}
	}
    return _.findWhere(mediaList, {
        'id': mediaId
    });
}
function login(wxAccount, firstTime) {
	if (firstTime && wxAccount.cookie && wxAccount.token) {
		client.setCookie(wxAccount.cookie);
		token = wxAccount.token;
		getMsgList(function(err, msgList) {
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
function getMsgList(callback) {
	client.get('/cgi-bin/message?t=message/list&count='
		+ viewCount +'&day=7&token='+ token +'&lang=zh_CN',	// day 7: today
	{}, {}, function(err, res, buf) {
		var msgList;
		try {
			var html = buf.toString(),
				listJson = html.match(/list : \((\{.+\})\)/)[1];
			msgList = JSON.parse(listJson).msg_item;
		} catch (err) {
			callback(new Error('Not Yet Login'));
			return;
		}
		callback(null, msgList);
	});
}
function md5(str) {
	return crypto.createHash('md5').update(str).digest('hex');
}

