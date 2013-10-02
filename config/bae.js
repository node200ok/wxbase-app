
var rootDir = __dirname + '/..',
    publicDir = rootDir + '/public';

module.exports = {
	env: 'production',
	port: process.env.APP_PORT,
    hostUrl: 'http://wxbase.duapp.com',
    wxPath: '/wx',
    wxToken: 'whahax'
}
