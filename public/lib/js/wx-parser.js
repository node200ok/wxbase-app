
var wxToXml = function(obj) {
	// TODO: use Array.prototype.join()
	var xml = '';
	xml += '<xml>';
	xml += [
		'<ToUserName><![CDATA['+ obj.toUserName +']]></ToUserName>',
		'<FromUserName><![CDATA['+ obj.fromUserName +']]></FromUserName>',
		'<CreateTime>'+ obj.createTime +'</CreateTime>',
		'<MsgType><![CDATA['+ obj.msgType +']]></MsgType>'
	].join('');
	if (obj.msgType === 'text') {
		xml += [
			'<Content><![CDATA['+ obj.content +']]></Content>'
		].join('');
	} else if (obj.msgType === 'image') {
		xml += [
			'<PicUrl><![CDATA['+ obj.picUrl +']]></PicUrl>'
		].join('');
	} else if (obj.msgType === 'voice') {
		//
	} else if (obj.msgType === 'link') {
		xml += [
			'<Title><![CDATA['+ obj.title +']]></Title>',
			'<Description><![CDATA['+ obj.description +']]></Description>',
			'<Url><![CDATA['+ obj.url +']]></Url>'
		].join('');
	} else if (obj.msgType === 'event') {
		xml += [
			'<Event><![CDATA['+ obj.event +']]></Event>',
			'<EventKey><![CDATA['+ obj.eventKey +']]></EventKey>'
		].join('');
	} else if (obj.msgType === 'music') {
		xml += [
			'<Music>',
				'<Title><![CDATA['+ obj.title +']]></Title>',
				'<Description><![CDATA['+ obj.description +']]></Description>',
				'<MusicUrl><![CDATA['+ obj.musicUrl +']]></MusicUrl>',
				'<HQMusicUrl><![CDATA['+ obj.hqMusicUrl +']]></HQMusicUrl>',
			'</Music>'
		].join('');
	} else if (obj.msgType === 'location') {
		xml += [
			'<Location_X>'+ obj.locationX +'</Location_X>',
			'<Location_Y>'+ obj.locationY +'</Location_Y>',
			'<Scale>'+ obj.scale +'</Scale>',
			'<Label><![CDATA['+ obj.label +']]></Label>'
		].join('');
	} else if (obj.msgType === 'news') {
		// TODO: now support only one
		xml += [
			'<ArticleCount>1</ArticleCount>',
			'<Articles>',
				'<item>',
					'<Title><![CDATA['+ obj.article.title +']]></Title>',
					'<Description><![CDATA['+ obj.article.description +']]></Description>',
					'<PicUrl><![CDATA['+ obj.article.picUrl +']]></PicUrl>',
					'<Url><![CDATA['+ obj.article.url +']]></Url>',
				'</item>',
			'</Articles>'
		].join('');
	}
	xml += '</xml>';
	return xml;
}
var wxToObj = function(xml) {
	var $xml = $(xml),
	obj = {
		toUserName: getCData($xml.find('ToUserName').html()),
		fromUserName: getCData($xml.find('FromUserName').html()),
		createTime: $xml.find('CreateTime').html(),
		msgType: getCData($xml.find('MsgType').html()),
		msgId: $xml.find('MsgId').html()
	}
	if (obj.msgType === 'text') {
		_.extend(obj, {
			content: getCData($xml.find('Content').html())
		});
	} else if (obj.msgType === 'image') {
		_.extend(obj, {
			picUrl: getCData($xml.find('PicUrl').html())
		});
	} else if (obj.msgType === 'voice') {
		//
	} else if (obj.msgType === 'link') {
		_.extend(obj, {
			title: getCData($xml.find('Title').html()),
			description: getCData($xml.find('Description').html()),
			url: getCData($xml.find('Url').html())
		});
	} else if (obj.msgType === 'event') {
		_.extend(obj, {
			event: getCData($xml.find('Event').html()),
			eventKey: getCData($xml.find('EventKey').html())
		});
	} else if (obj.msgType === 'music') {
		_.extend(obj, {
			title: getCData($xml.find('Music PicUrl').html()),
			description: getCData($xml.find('Music Description').html()),
			musicUrl: getCData($xml.find('Music MusicUrl').html()),
			hqMusicUrl: getCData($xml.find('Music HQMusicUrl').html())
		});
	} else if (obj.msgType === 'location') {
		_.extend(obj, {
			locationX: Number($xml.find('Location_X').html()),
			locationY: Number($xml.find('Location_Y').html()),
			scale: Number($xml.find('Scale').html()),
			label: getCData($xml.find('Label').html())
		});
	}
	return obj;
}

function getCData(str){
	return str ? str.substring(11, str.length - 5) : '';
}
