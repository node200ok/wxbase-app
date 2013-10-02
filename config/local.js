
var rootDir = __dirname + '/..',
    publicDir = rootDir + '/public',
    port = 3035;

module.exports = {
	env: 'production',
	port: port,
	rootDir: rootDir,
	publicDir: publicDir,
    hostUrl: 'http://localhost:' + port,
    wxPath: '/wx',
    wxToken: 'whahax'
}
