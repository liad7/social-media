let config

if (process.env.NODE_ENV === 'production' && false) {
  config = require('./prod')
} else {
  config = require('./dev')
}
config.isGuestMode = true
module.exports = config
