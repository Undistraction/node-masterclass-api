const fs = require('fs')
const path = require('path')

const helpers = require('./helpers')

const lib = {
  baseDir: path.join(__dirname, '../.data'),
}

const getFullpath = (dir, name) => {
  const filename = `${name}.json`
  return path.join(lib.baseDir, dir, filename)
}

lib.create = (dir, name, data, callback) => {
  fs.open(getFullpath(dir, name), 'wx', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      const stringData = JSON.stringify(data)
      fs.writeFile(fileDescriptor, stringData, err => {
        if (!err) {
          fs.close(fileDescriptor, err => {
            if (!err) {
              callback(false)
            } else {
              callback(`Couldn't close file`)
            }
          })
        } else {
          callback(`Couldn't write to file`)
        }
      })
    } else {
      callback(`Couldn't open file: ${err}`)
    }
  })
}

lib.read = (dir, name, callback) => {
  fs.readFile(getFullpath(dir, name), 'utf8', (err, data) => {
    if (!err && data) {
      const parsedData = helpers.parseJsonStringToObj(data)
      callback(err, parsedData)
    } else {
      callback(err, data)
    }
  })
}

lib.update = (dir, name, data, callback) => {
  fs.open(getFullpath(dir, name), 'r+', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      const stringData = JSON.stringify(data)
      fs.truncate(fileDescriptor, err => {
        if (!err) {
          fs.writeFile(fileDescriptor, stringData, err => {
            if (!err) {
              fs.close(fileDescriptor, err => {
                if (!err) {
                  callback(false)
                } else {
                  callback(`Couldn't close file: ${err}`)
                }
              })
            } else {
              callback(`Coudln't write to file ${err}`)
            }
          })
        } else {
          callback(`Coudln't truncate to file: ${err}`)
        }
      })
    } else {
      callback(`Couldn't open file: ${err}`)
    }
  })
}

lib.delete = (dir, name, callback) => {
  fs.unlink(getFullpath(dir, name), err => {
    if (!err) {
      callback(false)
    } else {
      callback(`Coudln't delete file: ${err}`)
    }
  })
}

module.exports = lib

// -----------------------------------------------------------------------------
// Usage
// -----------------------------------------------------------------------------

// const data = require('./lib/data')

// data.create(`test`, `newFile`, { alpha: `beta` }, err => {
//   if (!err) {
//     console.log(`Create Success`)
//   } else {
//     console.log(`Create Error: ${err}`)
//   }
// })

// data.update(`test`, `newFile`, { bravo: `charlie` }, err => {
//   if (!err) {
//     console.log(`Update Success`)
//   } else {
//     console.log(`Update Error: ${err}`)
//   }
// })

// data.read(`test`, `newFile`, (err, data) => {
//   if (!err && data) {
//     console.log(`Read Success: ${data}`)
//   } else {
//     console.log(`Error: ${err}`)
//   }
// })

// data.delete(`test`, `newFile`, err => {
//   if (!err) {
//     console.log(`Delete Success`)
//   } else {
//     console.log(`Delete Error: ${err}`)
//   }
// })
