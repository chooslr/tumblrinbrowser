import assert from 'assert'
import rewire from 'rewire'
import { recursiveAddPostTillDone } from '../src/util.js'
import * as v2 from '../rewired/v2.js'
import * as v1 from '../rewired/v1.js'

const { CONSUMER_KEY: api_key } = process.env
const account = 'ttttthhhhhhheemeeeee' // few posts account

describe('Timeline({ offset/start, type })', () => {
  const offset = 10
  const type = 'photo'

  const test = (feedPromise) => async () => {
    const total = await v1.total(account, { type })

    const feedPosts = await feedPromise
    const posts_all = await recursiveAddPostTillDone(feedPosts)

    assert.equal(posts_all.length, total - offset)
    assert(posts_all.every(post => post.type === type))
  }

  it('v2.Timeline',
    test(v2.Timeline({ api_key, account, params: { offset, type } })))
  it('v2.Timeline (random)',
    test(v2.Timeline({ api_key, account, params: { offset, type }, random: true })))
  it('v1.Timeline',
    test(v1.Timeline({ account, params: { start: offset, type } })))
  it('v1.Timeline (random)',
    test(v1.Timeline({ account, params: { start: offset, type }, random: true })))
})

describe('Timeline => throws', () => {
  describe('{ limit/num: 21/51 }', () => {
    const limit = 21
    const num = 51

    const test = (Ho, params) => () =>
      Ho({ api_key, account, params })
      .then(() => assert(false))
      .catch(() => assert(true))

    it('v2', test(v2.Timeline, { limit }))
    it('v1', test(v1.Timeline, { num }))
  })

  describe('{ offset/start: total }', () => {
    const test = (HofeedPromise) => () =>
      v1.total(account)
      .then(total => HofeedPromise(total))
      .then(() => assert(false))
      .catch(() => assert(true))

    it('v2.Timeline',
      test((total) => v2.Timeline({ api_key, account, params: { offset: total } })))
    it('v1.Timeline',
      test((total) => v1.Timeline({ account, params: { start: total } })))
  })
})