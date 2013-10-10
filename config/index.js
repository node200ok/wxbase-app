
var _ = require('underscore');

module.exports = function(mode) {
	var config = {}
	// 确保配置文件存在
	try {
        _.extend(config, require('./common'));
		_.extend(config, require('./' + mode));
	} catch (err) {
		throw new Error('Config Error');
	}
	return config;
}
