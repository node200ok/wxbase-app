
var fs = require('fs'),
	_ = require('underscore'),
	domino = require('domino'),
	Zepto = require('zepto-node'),
	window = domino.createWindow(),
	$ = Zepto(window),
	Client = require('../lib/client'),
	client = new Client('mp.weixin.qq.com');

client.cookie = {
	cert: 'lZc7ykqkow17o2TTJYM2R7CZssgdTmCe',
	slave_user: 'gh_83662f3e2b71',
	slave_sid: 'SU1oNHBVdDlidEdRd09SaVpYSzFGNXY2TXFFRXViZ2NYeGVsb0hzeDc2a0VVYVVSNkNTSkhtUHJNcjRnQ2txeFJFUWNpZ0txbTMxZmVWNWt3WTNiaFFDM2dFalJaSG5OaWNfQXNKWU9NWjFZUzZpbm1vOFRmaXRoMnBuaHQ4Snc='
}

client.get('/cgi-bin/message?t=message/list&token=1937657309&count=20&day=7',
{}, {}, function(err, res, buf) {
	var html = buf.toString(),
		listStr = html.match(/list : \((\{.+\})\)/)[1],
		items = JSON.parse(listStr).msg_item,
		mediaItems = _.where(items, {
			type: 3
		}),
		ids = _.pluck(mediaItems, 'id');
	console.log(ids);
	
	client.get('/cgi-bin/getvoicedata?msgid=81&fileid=&token=1937657309&lang=zh_CN',
	{
		'Accept': '*/*',
		'Accept-Encoding': 'identity;q=1, *;q=0',
		'Accept-Language': 'zh-CN,zh;q=0.8',
		'Host': 'mp.weixin.qq.com',
		'Range': 'bytes=0-',
		'Referer': 'https://mp.weixin.qq.com/cgi-bin/message?t=message/list&token=1937657309&count=20&day=7'
	}, {}, function(err, res, buf) {
		fs.writeFileSync(__dirname + '/dest/a.mp3', buf);
	});
});
