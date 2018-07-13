const { defaultTo, pipe, prop, __ } = require('ramda')
const { isUndefined } = require('ramda-adjunct')

const http = require('http')
const https = require('https')
const url = require('url')
const fs = require('fs')
const StringDecoder = require('string_decoder').StringDecoder

const { httpPort, httpsPort, envName } = require('./config')
const handlers = require(`./lib/handlers`)
const helpers = require(`./lib/helpers`)

// -----------------------------------------------------------------------------
// App
// -----------------------------------------------------------------------------

const router = {
  ping: handlers.ping,
  users: handlers.users,
}

const resolveHandler = pipe(
  prop(__, router),
  defaultTo(handlers.notFound)
)

const parseUrl = req => {
  // Parse URL
  const parsedUrl = url.parse(req.url, true)

  return {
    trimmedPath: parsedUrl.pathname.replace(/^\/|\/$/g, ``),
    queryStringObj: parsedUrl.query,
    method: req.method.toLowerCase(),
    headers: req.headers,
  }
}

const unifiedServer = (req, res) => {
  const parsedUrl = parseUrl(req)
  // Payload
  const decoder = new StringDecoder(`utf-8`)
  let buffer = ``
  req.on('data', data => (buffer += decoder.write(data)))
  req.on('end', () => {
    buffer += decoder.end()

    // Choose a handler or notFound handler if no handler exists
    const handler = resolveHandler(parsedUrl.trimmedPath)

    // Add the buffer as payload
    parsedUrl.payload = helpers.parseJsonStringToObj(buffer)

    handler(parsedUrl, (statusCode = 200, payload = {}) => {
      const payloadString = JSON.stringify(payload)
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(statusCode)
      res.end(payloadString)
    })
  })
}

// -----------------------------------------------------------------------------
// HTTP
// -----------------------------------------------------------------------------

const httpServer = http.createServer(unifiedServer)

httpServer.listen(httpPort, () => {
  console.log(
    `HTTP Server listening on port '${httpPort}' in '${envName}' mode`
  )
})

// -----------------------------------------------------------------------------
// HTTP
// -----------------------------------------------------------------------------

const httpsServerOpts = {
  key: fs.readFileSync(`./https/key.pem`),
  cert: fs.readFileSync(`./https/cert.pem`),
}

const httpsServer = https.createServer(httpsServerOpts, unifiedServer)

httpsServer.listen(httpsPort, () => {
  console.log(
    `HTTPS Server listening on port '${httpsPort}' in '${envName}' mode`
  )
})
