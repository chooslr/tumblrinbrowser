const rewire = require('rewire')
const fetch = require('node-fetch')

const jsonp = (src, timeout) =>
  fetch(src)
  .then(res => res.text())
  .then(text => {
    const jsonstring = text.slice(text.indexOf('{'), text.length - 2)
    if (!jsonstring) throw new Error(text)
    return JSON.parse(jsonstring)
  })

const modules = rewire('./src/v1.js')
modules.__set__({ _jsonpSimple2: { default: jsonp } })
module.exports = modules