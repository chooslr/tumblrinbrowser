import assert from 'assert'
import { recursiveAddPostTillDone } from '../src/util.js'
import * as v2 from '../rewired.v2.js'
import * as v1 from '../rewired.v1.js'

const { CONSUMER_KEY: api_key } = process.env
const name = 'ttttthhhhhhheemeeeee' // few posts name

describe('generatePosts({ offset/start, type })', () => {
  const offset = 10
  const type = 'photo'

  const test = (feedPromise) => async () => {
    const total = await v1.total(name, { type })

    const feedPosts = await feedPromise
    const posts_all = await recursiveAddPostTillDone(feedPosts)

    assert.equal(posts_all.length, total - offset)
    assert(posts_all.every(post => post.type === type))
  }

  it('v2.generatePosts',
    test(v2.generatePosts({ api_key, name, params: { offset, type } })))
  it('v2.generatePosts (random)',
    test(v2.generatePosts({ api_key, name, params: { offset, type }, random: true })))
  it('v1.generatePosts',
    test(v1.generatePosts({ name, params: { start: offset, type } })))
  it('v1.generatePosts (random)',
    test(v1.generatePosts({ name, params: { start: offset, type }, random: true })))
})

describe('generatePosts => throws', () => {
  describe('{ limit/num: 21/51 }', () => {
    const limit = 21
    const num = 51

    const test = (Ho, params) => () =>
      Ho({ api_key, name, params })
      .then(() => assert(false))
      .catch(() => assert(true))

    it('v2', test(v2.generatePosts, { limit }))
    it('v1', test(v1.generatePosts, { num }))
  })

  describe('{ offset/start: total }', () => {
    const test = (HofeedPromise) => () =>
      v1.total(name)
      .then(total => HofeedPromise(total))
      .then(() => assert(false))
      .catch(() => assert(true))

    it('v2.generatePosts',
      test((total) => v2.generatePosts({ api_key, name, params: { offset: total } })))
    it('v1.generatePosts',
      test((total) => v1.generatePosts({ name, params: { start: total } })))
  })
})