const { pipe, when, toLower, prop, defaultTo, __ } = require('ramda')
const { isString } = require('ramda-adjunct')

const environments = {}

environments.staging = {
  envName: `staging`,
  httpPort: 3000,
  httpsPort: 3001,
  hashingSecret: `Ladidadi`,
}

environments.production = {
  envName: `production`,
  httpPort: 5000,
  httpsPort: 5001,
  hashingSecret: `Blahblah`,
}

const currentEnvironment = pipe(
  when(isString, toLower),
  prop(__, environments),
  defaultTo(environments.staging)
)(process.env.NODE_ENV)

module.exports = currentEnvironment
