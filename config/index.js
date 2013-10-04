
var _ = require('underscore'),
	rootDir = __dirname + '/..',
	publicDir = rootDir + '/public',
	voiceDir = publicDir + '/voice';

module.exports = function(mode) {
	var config = {
		rootDir: rootDir,
		publicDir: publicDir,
		voiceDir: voiceDir,
		wxPath: '/wx',
    	wxToken: 'whahax'
	}
	// 确保配置文件存在
	try {
		_.extend(config, require('./' + mode));
	} catch (err) {
		throw new Error('Config file not found');
	}
	return config;
}
