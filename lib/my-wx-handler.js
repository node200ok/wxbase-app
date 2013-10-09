
var fs = require('fs'),
	_ = require('underscore'),
	wxVoiceThief = require('./wx-voice-thief');

var voiceDir, pubVoiceDir,
	delaySteal = 500;

exports.init = function(config, app) {
	voiceDir = config.voiceDir;
	pubVoiceDir = voiceDir.replace(config.publicDir, config.hostUrl);
	wxVoiceThief.init(config.wxAccount);
	
	// manage voice
	app.get('/list_voice', function(req, res, next) {
		fs.readdir(voiceDir, function(err, files) {
			res.send(files);
		});
	});
	app.get('/clear_voice', function(req, res, next) {
		fs.readdir(voiceDir, function(err, files) {
			_.each(files, function(val) {
				fs.unlinkSync(voiceDir + '/' + val);
			});
			res.send('cleared');
		});
	});
	return this;
}
exports.subHandlers = {};

exports.subHandlers['voice'] = function(reqObj, resObj, callback) {
    // delay to steal
    setTimeout(function() {
        wxVoiceThief.steal(function(err, media) {
            if (err) {
                console.error(err);
                _.extend(resObj, {
                    msgType: 'text',
                    content: '你发送了语音'
                });
            } else {
                var ext = 'mp3',
                    file = media['id'] + '.' + ext,
                    filePath = voiceDir + '/' + file;
                _.extend(resObj, {
                    msgType: 'music',
                    music: {
                        title: '你发送了语音',
                        description: Math.round(media['play_length'] / 1000) + '″',
                        musicUrl: pubVoiceDir + '/' + file,
                        hqMusicUrl: pubVoiceDir + '/' + file
                    }
                });
                fs.existsSync(filePath) || fs.writeFile(filePath, media['data'], function() {
                    console.log('saved voice: ' + file);
                });
            }
            callback(resObj);
        });
    }, delaySteal);
}
exports.subHandlers['text'] = function(reqObj, resObj, callback) {
    _.extend(resObj, {
        msgType: 'text',
        content: '你发送了文字: ' + reqObj.content
    });
    // test news
    if (reqObj.content === '1') {
        _.extend(resObj, {
            msgType: 'news',
            articles: [{
                title: 'Hahahaha',
                description: 'yoyoyoyo~',
                picUrl: 'http://sztqb.sznews.com/res/1/641/2013-04/03/C01/res01_attpic_brief.jpg',
                url: 'http://mp.weixin.qq.com/wiki/index.php?title=%E6%B6%88%E6%81%AF%E6%8E%A5%E5%8F%A3%E6%8C%87%E5%8D%97'
            }]
        });
    }
    callback(resObj);
}
exports.subHandlers['location'] = function(reqObj, resObj, callback) {
    _.extend(resObj, {
        msgType: 'text',
        content: '你发送了位置'
    });
    callback(resObj);
}
exports.subHandlers['image'] = function(reqObj, resObj, callback) {
    _.extend(resObj, {
        msgType: 'text',
        content: '你发送了图片'
    });
    callback(resObj);
}
exports.subHandlers['subscribe'] = function(reqObj, resObj, callback) {
    _.extend(resObj, {
        msgType: 'text',
        content: '你关注了我'
    });
    callback(resObj);
}
exports.subHandlers['unsubscribe'] = function(reqObj, resObj, callback) {
    _.extend(resObj, {
        msgType: 'text',
        content: '你取消了关注'
    });
    callback(resObj);
}
exports.subHandlers['CLICK'] = function(reqObj, resObj, callback) {
    _.extend(resObj, {
        msgType: 'text',
        content: '你点击了按键: ' + reqObj.eventKey
    });
    callback(resObj);
}
exports.subHandlers['DEFAULT'] = function(reqObj, resObj, callback) {
    _.extend(resObj, {
        msgType: 'text',
        content: '默认回复'
    });
    callback(resObj);
}

