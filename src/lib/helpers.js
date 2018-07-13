const { isNonEmptyString } = require(`ramda-adjunct`)
const crypto = require(`crypto`)
const config = require(`../config`)

const helpers = {}

helpers.hash = password => {
  if (isNonEmptyString(password)) {
    return crypto
      .createHmac(`sha256`, config.hashingSecret)
      .update(password)
      .digest(`hex`)
  }
  return false
}

helpers.parseJsonStringToObj = str => {
  try {
    return JSON.parse(str)
  } catch (err) {
    return {}
  }
}

module.exports = helpers
