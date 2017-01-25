const http = require('http')
const fs = require('fs')
const path = require('path')
const request = require('request').defaults({ encoding: null, rejectUnauthorized: false })
const faviconUrls = ['https://www.google.com/favicon.ico',
  'https://www.reddit.com/favicon.ico',
  'https://www.linkedin.com/favicon.ico']

const server = http.createServer(function (request, response) {
  if (request.method === 'GET' && request.url === '/favicon.ico') {
    response.writeHead(200, {'Content-Type': 'image/x-icon'})
    fs.createReadStream(path.join(__dirname, 'favicon.ico')).pipe(response)
  } else {
    let iconPromises = faviconUrls.map(iconUrl => {
      return getIcon(iconUrl)
    })
    Promise.all(iconPromises).then(function (icons) {
      response.writeHead(200, {'Content-Type': 'text/html'})
      icons.map(icon => {
        response.write(`<img src="data:image/x-icon;base64,${icon}" />`)
      })
      response.end()
    }, function (errorMessage) {
      response.writeHead(400)
      response.end()
      console.log(errorMessage)
    })
  }
})

function getIcon (requestUrl) {
  return new Promise(function (resolve, reject) {
    request(requestUrl, function (error, response, body) {
      if (error) {
        reject(error)
      }
      const icon = Buffer.from(body).toString('base64')
      resolve(icon)
    })
  })
}

server.listen(3000)
