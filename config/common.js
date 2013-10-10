
var rootDir = __dirname + '/..',
    publicDir = rootDir + '/public',
    voiceDir = publicDir + '/voice',
    wxAccount = require('../private/wx-account');	// private

module.exports = {
    rootDir: rootDir,
    publicDir: publicDir,
    voiceDir: voiceDir,
    wxPath: '/wx',
    wxToken: 'whahax',
    wxAccount: wxAccount,
    hostUrl: 'http://wxbase.duapp.com'
}
