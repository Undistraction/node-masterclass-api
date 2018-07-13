const { isEmpty, contains, filter, dissoc, reject, merge } = require(`ramda`)

const { isFalse, isNotEmpty } = require(`ramda-adjunct`)
const dataAdaptor = require(`./dataAdaptor`)
const helpers = require(`./helpers`)
const validators = require(`./validators`)

const handlers = {}

// -----------------------------------------------------------------------------
// Users
// -----------------------------------------------------------------------------

const users = {}

const getUser = (phone, callback) => dataAdaptor.read(`users`, phone, callback)

users.get = (data, callback) => {
  const phone = validators.phone(data.queryStringObj.phone)

  if (phone) {
    getUser(phone, (err, data) => {
      if (!err && data) {
        // remove hashed password
        const sanitisedData = dissoc(`hashedPassword`, data)
        callback(200, sanitisedData)
      } else {
        callback(404)
      }
    })
  } else {
    callback(400, { error: `Missing required field` })
  }
}

users.post = (data, callback) => {
  const firstName = validators.firstName(data.payload.firstName)
  const lastName = validators.lastName(data.payload.lastName)
  const phone = validators.phone(data.payload.phone)
  const password = validators.password(data.payload.password)
  const tosAgreement = validators.tosAgreement(data.payload.tosAgreement)

  const invalidFields = filter(isFalse, {
    firstName,
    lastName,
    phone,
    password,
    tosAgreement,
  })

  if (isEmpty(invalidFields)) {
    getUser(phone, (err, data) => {
      if (err) {
        const hashedPassword = helpers.hash(password)

        if (hashedPassword) {
          // Hash the password
          const user = {
            firstName,
            lastName,
            phone,
            hashedPassword,
            tosAgreement,
          }
          dataAdaptor.create(`users`, phone, user, err => {
            if (!err) {
              console.log(`Created User`, phone)
              callback(200)
            } else {
              console.log(`Error creating new user: ${err}`)
              callback(500, { error: `Couldn't create new user` })
            }
          })
        } else {
          callback(500, { error: `Couldn't create hash of password` })
        }
      } else {
        callback(400, { error: `User already exists with that phone number` })
      }
    })
  } else {
    callback(400, {
      error: `Invalid field(s): ${JSON.stringify(invalidFields)}`,
    })
  }
}

users.put = (data, callback) => {
  // Required
  const phone = validators.phone(data.payload.phone)

  // Optional
  const firstName = validators.firstName(data.payload.firstName)
  const lastName = validators.lastName(data.payload.lastName)
  const password = validators.password(data.payload.password)

  if (phone) {
    const fieldsToUpdate = reject(isFalse, { firstName, lastName, password })
    if (isNotEmpty(fieldsToUpdate)) {
      getUser(phone, (err, data) => {
        if (!err && data) {
          const newData = merge(data, fieldsToUpdate)
          dataAdaptor.update(`users`, phone, newData, err => {
            if (!err) {
              callback(200)
            } else {
              console.log(`Couldn't update user: ${err}`)
              callback(500, { error: `Couldn't update user` })
            }
          })
        } else {
          callback(400, { error: `User didn't exist` })
        }
      })
    } else {
      callback(400, { error: `No fields supplied to update` })
    }
  } else {
    callback(400, { error: `Must include valid 'phone'` })
  }
}

users.delete = (data, callback) => {
  const phone = validators.phone(data.queryStringObj.phone)

  if (phone) {
    getUser(phone, (err, data) => {
      if (!err && data) {
        dataAdaptor.delete(`users`, phone, err => {
          if (!err) {
            callback(200)
          } else {
            callback(500, { error: `Couldn't delete user` })
          }
        })
      } else {
        callback(400, { error: `Couldn't find user` })
      }
    })
  } else {
    callback(400, { error: `Missing required field` })
  }
}

// -----------------------------------------------------------------------------
// Handlers
// -----------------------------------------------------------------------------

handlers.ping = (data, callback) => {
  callback(200)
}

handlers.notFound = (data, callback) => {
  callback(404)
}

handlers.users = (data, callback) => {
  const acceptedMethods = [`get`, `post`, `put`, `delete`]
  const { method } = data
  if (contains(method, acceptedMethods)) {
    users[method](data, callback)
  } else {
    callback(405)
  }
}

module.exports = handlers
