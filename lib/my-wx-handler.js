
var path = require('path'),
	_ = require('underscore'),
	wxVoiceThief = require('./wx-voice-thief');

var pubVoiceDir;

exports.init = function(config) {
	var publicDir = config.publicDir,
		voiceDir = config.voiceDir,
		hostUrl = config.hostUrl,
		wxAccount = config.wxAccount;
	pubVoiceDir = voiceDir.replace(publicDir, hostUrl);
	wxVoiceThief.init(wxAccount, voiceDir);
	return this;
}
exports.handle = function(reqObj, callback) {
	var self = this, resObj = {
		toUserName: reqObj.fromUserName,
		fromUserName: reqObj.toUserName,
		createTime: new Date().getTime()
	}
	if (! reqObj) {
		resObj = null;
		callback(resObj);
		return self;
	}
	if (reqObj.msgType === 'event') {
		if (reqObj.event === 'subscribe') {	// 关注
			_.extend(resObj, {
				msgType: 'text',
				content: '你关注了我'
			});
		} else if (reqObj.event === 'unsubscribe') {	// 取消关注
			resObj = null;
		} else if (reqObj.event === 'CLICK') {	// 菜单按键
			_.extend(resObj, {
				msgType: 'text',
				content: '你点击了按键: ' + reqObj.eventKey
			});
		}
	} else if (reqObj.msgType === 'text') {	// 文本消息
		_.extend(resObj, {
			msgType: 'text',
			content: '你发送了文字: ' + reqObj.content
		});
		
		if (reqObj.content === '1') {
			_.extend(resObj, {
				msgType: 'news',
				article: {
				  	title: 'Hahahaha',
					description: 'yoyoyoyo~',
					picUrl: 'http://sztqb.sznews.com/res/1/641/2013-04/03/C01/res01_attpic_brief.jpg',
					url: 'http://mp.weixin.qq.com/wiki/index.php?title=%E6%B6%88%E6%81%AF%E6%8E%A5%E5%8F%A3%E6%8C%87%E5%8D%97'
				}
			});
		}
	} else if (reqObj.msgType === 'voice') {	// 语音消息
		// steal voice
		wxVoiceThief.steal(function(filename) {
			/*_.extend(resObj, {
				msgType: 'text',
				content: '你发送了语音'
			});*/
			if (filename) {
				_.extend(resObj, {
					msgType: 'music',
					title: '你发送了语音',
					description: '',
					musicUrl: pubVoiceDir + '/' + filename,
					hqMusicUrl: pubVoiceDir + '/' + filename
				});
			} else {
				resObj = null;
			}
			callback(resObj);
		});
		return self;
	} else if (reqObj.msgType === 'image') {	// 图片消息
		_.extend(resObj, {
			msgType: 'text',
			content: '你发送了图片'
		});
	} else if (reqObj.msgType === 'location') {	// 位置消息
		_.extend(resObj, {
			msgType: 'text',
			content: '你发送了位置'
		});
	} else {	// 未知消息
		resObj = null;
	}
	callback(resObj);
	return self;
}
