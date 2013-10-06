
var _ = require('underscore'),
	domino = require('domino'),
	Zepto = require('zepto-node'),
	window = domino.createWindow(),
	$ = Zepto(window),
	md5 = require('../lib/md5'),
	Client = require('../lib/client'),
	client = new Client('mp.weixin.qq.com'),
	config = require('../config/')('local');

client.post('/cgi-bin/login?lang=zh_CN', {
	username: config.wxAccount.username,
	pwd: md5(config.wxAccount.password),
	imgcode: "",
	f: "json"
}, {
	'Referer': 'https://mp.weixin.qq.com/'
}, function(err, res, buf) {
	var resTxt = buf.toString(),
		resObj = JSON.parse(resTxt),
		errCode = resObj['ErrCode'];
	
	if (! _.contains([0, 65201, 65202], errCode)) {
		throw new Error('Wx public account login fail');
	} else {
		var homeUrl = resObj['ErrMsg'],
			token = homeUrl.match(/token=(.+)$/)[1];
		
		client.get('/cgi-bin/message?t=message/list&token='+ token +'&count=20&day=7',
		{}, {}, function(err, res, buf) {
			var html = buf.toString(),
				listStr = html.match(/list : \((\{.+\})\)/)[1],
				items = JSON.parse(listStr).msg_item,
				mediaItems = _.where(items, {
					type: 3
				});
			
			var media = mediaItems[0];
			client.get('/cgi-bin/getvoicedata?msgid='+ media['id'] +'&fileid=&token='+ token +'&lang=zh_CN',
			{}, {}, function(err, res, buf) {
				var ext = mime.extension('audio/mp3');
				console.log(ext)
			});
		});
	}
});

