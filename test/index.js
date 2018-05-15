import assert from 'assert'
import * as v2 from '../rewired.v2.js'
import * as v1 from '../rewired.v1.js'

const { CONSUMER_KEY: api_key } = process.env
const name = 'staff'

describe('posts', () => {

  describe('v2', () => {
    const { posts: api } = v2

    it(`{}`, async () => {
      const posts = await api({ api_key, name })
      assert.equal(posts.length, 20)
    })

    it(`{ type, limit: 1 }`, () => Promise.all(
      v2.postTypes.map(type =>
        api({ api_key, name, params: { type, limit: 1 } }).then(posts => {
          if (posts.length) assert.equal(posts.length, 1)
          assert.ok(posts.every(post => post.type === type))
        })
      )
    ))
  })

  describe('v1', () => {
    const { posts: api } = v1

    it(`{}`, async () => {
      const posts = await api(name)
      assert.equal(posts.length, 20)
    })

    describe('{ type, num: 1 }', () => {
      const test = (type, resType) => () =>
        api(name, { type, num: 1 }).then(posts => {
          if (posts.length) assert.equal(posts.length, 1)
          assert.ok(posts.every(post => post.type === (resType || type)))
        })

      it('text/regular', test('text', 'regular'))
      it('quote', test('quote'))
      it('photo', test('photo'))
      it('link', test('link'))
      it('chat/conversation', test('chat', 'conversation'))
      it('video', test('video'))
      it('audio', test('audio'))
    })
  })

})

describe('total', () => {

  describe(`v2`, () => {
    const { total: api } = v2
    const test = (params) => () => api({ api_key, name, params }).then(total => assert.ok(typeof total === 'number'))
    it('{}', test())
    it('{ type }', test({ type: 'video' }))
    it('{ tag }', test({ tag: 'red alert' }))
  })

  describe(`v1`, () => {
    const { total: api } = v1
    const test = (params) => () => api(name, params).then(total => assert.ok(typeof total === 'number'))
    it('{}', test())
    it('{ type }', test({ type: 'video' }))
    it('{ tag }', test({ tag: 'red alert' }))
  })

})

describe('post', () => {

  // const id = '99671967250'
  const id = 99671967250

  describe(`v2`, () => {
    const { post: api } = v2
    const reblog_info_keys = [
      'reblogged_from_id',
      'reblogged_from_url',
      'reblogged_from_name',
      'reblogged_from_title',
      'reblogged_from_uuid',
      'reblogged_from_can_message',
      'reblogged_root_id',
      'reblogged_root_url',
      'reblogged_root_name',
      'reblogged_root_title',
      'reblogged_root_uuid',
      'reblogged_root_can_message'
    ]

    const test = (params) => () =>
      api({ api_key, name, id, params }).then(post => {
        const { notes_info, reblog_info } = params || {}

        assert.equal(post.id, id)

        assert.ok(notes_info ? Array.isArray(post.notes) : !Array.isArray(post.notes))

        const post_keys = Object.keys(post)
        assert.ok(reblog_info_keys.every(reblog_info_key =>
          reblog_info
          ? post_keys.includes(reblog_info_key)
          : !post_keys.includes(reblog_info_key)
        ))
      })

    it('{}', test())
    it('{ reblog_info }', test({ reblog_info: true }))
    it('{ notes_info }', test({ notes_info: true }))
  })

  describe(`v1`, () => {
    const { post: api } = v1
    it('{}', () => api(name, id).then(post => assert.equal(post.id, id)))
  })
})

describe('blog', () => {
  it(`v2`, () => {
    const { blog: api } = v2
    return api({ api_key, name }).then(blog => assert.ok(blog.name, name))
  })
  it(`v1`, () => {
    const { blog: api } = v1
    return api(name).then(blog => assert.ok(blog.name, name))
  })
})

describe('sampling', () => {
  const type = 'photo'
  const denom = 4
  const maxLimit = 3

  describe('samplingPosts({ denom, maxLimit, params: { type } })', () => {
    const test = (promise) => () => promise.then(posts => assert.ok(posts.every(post => post.type === type)))
    it('v2',
      test(v2.samplingPosts({ name, params: { type }, denom, maxLimit, api_key })))
    it('v1',
      test(v1.samplingPosts({ name, params: { type }, denom, maxLimit })))
  })

  describe('samplingTags({ denom, maxLimit, params: { type } })', () => {
    const test = (promise) => () => promise.then(tags => assert.ok(tags.every(tag => typeof tag === 'string')))
    it('v2',
      test(v2.samplingTags({ name, params: { type }, denom, maxLimit, api_key })))
    it('v1',
      test(v1.samplingTags({ name, params: { type }, denom, maxLimit })))
  })
})

describe(`avatar`, () => {

  const { avatar: api } = v2

  it('{}', () => {
    const url = api(name)
    assert.ok(typeof url === 'string')
  })

  it('{ size }', () =>
    v2
    .avatarSizes
    .map(size => api(name, size))
    .forEach(url =>
      assert.ok(typeof url === 'string')
    )
  )
})