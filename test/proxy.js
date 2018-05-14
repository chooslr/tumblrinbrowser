import assert from 'assert'
import Koa from 'koa'
import proxy from 'koa-proxies'
import Tumblr from '../rewired.v2.js'

const port = 7000
const endpoint = '/proxypoint'

describe('proxy', () => {
  const tumblr = new Tumblr({ proxy: `http://localhost:${port}${endpoint}` })
  const account = 'staff'

  it('blog()', () => tumblr.blog(account))
  it('posts()', () => tumblr.posts(account, { type: 'quote' }))
  it('total()', () => tumblr.total(account, { type: 'text' }))
  it('post()', () => tumblr.post(account, 99671967250))
  it('samplingPosts()', () => tumblr.samplingPosts({ account }))
  it('samplingTags()', () => tumblr.samplingTags({ account }))
  it('generatePosts()', () => tumblr.generatePosts({ account }))
})

let server

before(() =>
  server =
  new Koa()
  .use(proxy(
    endpoint,
    {
      target: 'https://api.tumblr.com',
      changeOrigin: true,
      rewrite: (path) =>
        (endpoint === '/' ? path : path.split(endpoint).join('')) +
        (path.includes('?') ? '&' : '?') +
        `api_key=${process.env.CONSUMER_KEY}`
    }
  ))
  .listen(port)
)

after(() => server.close())