
var fs = require('fs'),
	_ = require('underscore'),
	md5 = require('./md5'),
	Client = require('./client'),
	client = new Client('mp.weixin.qq.com');

var logined = false, token, voiceDir, format = 'mp3';

exports.init = function(wxAccount, voiceDir_) {
	voiceDir = voiceDir_;
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
			console.error(getErrMsg(errCode));
			throw new Error('Wx public account login fail');
		} else {
			homeUrl = resObj['ErrMsg'];
			token = homeUrl.match(/token=(.+)$/)[1];
			logined = true;
		}
	});
	return this;
}
exports.steal = function(callback) {
	if (! logined) return callback(null);
	client.get('/cgi-bin/message?t=message/list&token=' + token + '&count=20&day=7',
	{}, {}, function(err, res, buf) {
		var html = buf.toString(),
			listStr = html.match(/list : \((\{.+\})\)/)[1],
			items = JSON.parse(listStr).msg_item,
			mediaItems = _.where(items, {
				type : 3
			}),
			ids = _.pluck(mediaItems, 'id'),
			theFirstId = ids[0];
		
		fs.existsSync(voiceDir) || fs.mkdirSync(voiceDir);
		_.each(ids, function(id, i) {
			client.get('/cgi-bin/getvoicedata?msgid=' + id + '&fileid=&token=' + token + '&lang=zh_CN',
			{}, {}, function(err, res, buf) {
				var filename = id + '.' + format,
					filepath = voiceDir + '/' +  filename;
				if (! fs.existsSync(filepath)) {
					fs.writeFile(filepath, buf, function(err) {
						if (id === theFirstId) {
							callback(filename);
						}
						console.log('saved voice: ' + id);
					});
				} else {
					if (id === theFirstId) {
						callback(filename);
					}
				}
			});
		});
	});
	return this;
}


function getErrMsg(errCode) {
	// MODIFIED FROM https://res.wx.qq.com/mpres/zh_CN/htmledition/js/wxm2-loginform17e4f5.js
	var i;
	switch ('' + errCode) {
		case "-1":
			i = "系统错误，请稍候再试。";
			break;
		case "-2":
			i = "帐号或密码错误。";
			break;
		case "-3":
			i = "您输入的帐号或者密码不正确，请重新输入。";
			break;
		case "-4":
			i = "不存在该帐户。";
			break;
		case "-5":
			i = "您目前处于访问受限状态。";
			break;
		case "-6":
			//i = "请输入图中的验证码";
			i = "已需要验证码，请稍后重试";
		case "-7":
			i = "此帐号已绑定私人微信号，不可用于公众平台登录。";
			break;
		case "-8":
			i = "邮箱已存在。";
			break;
		case "-32":
			//i = "您输入的验证码不正确，请重新输入";
			i = "已需要验证码，请稍后重试";
			break;
		case "-200":
			i = "因频繁提交虚假资料，该帐号被拒绝登录。";
			break;
		case "-94":
			i = "请使用邮箱登陆。";
			break;
		case "10":
			i = "该公众会议号已经过期，无法再登录使用。";
			break;
		case "65201":
		case "65202":
			i = "成功登陆，正在跳转...";
		case "0":
			i = "成功登陆，正在跳转...";
		case "-100":
			i = '海外帐号请在公众平台海外版登录,<a href="http://admin.wechat.com/">点击登录</a>';
			break;
		default:
			i = "未知的返回。";
	}
	return i;
}
