
var rootDir = __dirname + '/..',
    publicDir = rootDir + '/public';

module.exports = {
	env: 'production',
	port: process.env.APP_PORT,
	rootDir: rootDir,
	publicDir: publicDir,
    hostUrl: 'http://wxbase.duapp.com',
    wxPath: '/wx',
    wxToken: 'whahax'
}
