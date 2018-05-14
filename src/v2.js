import tiloop from 'tiloop'
import {
  identifier,
  joinParams,
  throws,
  asserts,
  SAMPLING_DENOM,
  SAMPLING_MAX_NUM,
  recursiveAddPostTillDone,
  postsToTags
} from './util.js'

const ORIGIN = 'https://api.tumblr.com'
const API_URL = (account, proxy) => `${proxy ? pathformat(proxy) : ORIGIN}/v2/blog/${identifier(account)}`
const pathformat = (path) => path[path.length - 1] === '/' ? path.slice(0, path.length - 1) : path
const MAX_LIMIT = 20
const method = 'GET'
const mode = 'cors'

export const postTypes = ['quote', 'text', 'chat', 'photo', 'link', 'video', 'audio', 'answer']

export const avatarSizes = [16, 24, 30, 40, 48, 64, 96, 128, 512]

export const avatar = (account, size = 64) => `${API_URL(account)}/avatar/${size}`

const isSuccess = status => status === 200 || status === 201

const fetchInterface = (...arg) =>
  fetch(...arg)
  .then(res =>
    isSuccess(res.status)
    ? res.json()
    : throws(res.statusText)
  )
  .then(({ meta: { status, msg }, response }) =>
    isSuccess(status)
    ? response
    : throws(msg)
  )

const requireAssert = (api_key, proxy) =>
  asserts(
    typeof api_key === 'string' || typeof proxy === 'string',
    'required api_key || proxy'
  )

const accountAssert = (account) =>
  asserts(
    typeof account === 'string',
    'required account'
  )

const postsInterface = ({ api_key, proxy, account, params } = {}) => {

  requireAssert(api_key, proxy)
  accountAssert(account)

  const { type, tag, id, limit, offset, reblog_info, notes_info, filter } = params || {}

  return fetchInterface(
    `${API_URL(account, proxy)}/posts` + joinParams({ api_key, type, tag, id, limit, offset, reblog_info, notes_info, filter }),
    { method, mode }
  )
}

const infoInterface = ({ api_key, proxy, account } = {}) => {

  requireAssert(api_key, proxy)
  accountAssert(account)

  return fetchInterface(
    `${API_URL(account, proxy)}/info` + joinParams({ api_key }),
    { method, mode }
  )
}

export const blog = (options) =>
  infoInterface(options)
  .then(({ blog }) => blog)

export const posts = (options) =>
  postsInterface(options)
  .then(({ posts }) => posts)

export const total = ({ api_key, proxy, account, params } = {}) => {
  const { type, tag } = params || {}
  return postsInterface({ api_key, proxy, account, params: { limit: 1, type, tag } })
  .then(({ total_posts }) => total_posts)
}

export const post = ({ api_key, proxy, account, id, params } = {}) => {
  asserts(typeof id === 'string' || typeof id === 'number', 'required id')
  const { reblog_info, notes_info } = params || {}
  return postsInterface({ api_key, proxy, account, params: { id, reblog_info, notes_info } })
  .then(({ posts }) => posts[0])
}


export const samplingTags = (options) => samplingPosts(options).then(postsToTags)

export const samplingPosts = async ({ api_key, proxy, account, params, denom, maxLimit } = {}) => {

  denom = denom || SAMPLING_DENOM
  maxLimit = maxLimit || SAMPLING_MAX_NUM
  asserts(maxLimit <= MAX_LIMIT, 'invalid maxLimit')

  const { type, tag, reblog_info, notes_info, filter } = params || {}

  const length = await total({ api_key, proxy, account, params: { type, tag } })
  asserts(length > 0, 'sampling account has no posts')

  const maxIncrement = Math.floor(length / denom)
  asserts(maxIncrement > 0, 'invalid denom')

  return recursiveAddPostTillDone(
    tiloop({
      length,
      maxIncrement,
      random: true,
      promisify: true,
      yielded: (indexedArr) =>
        posts({
          api_key,
          proxy,
          account,
          params: {
            offset: indexedArr[0],
            limit: indexedArr.length < maxLimit ? indexedArr.length : maxLimit,
            type,
            tag,
            reblog_info,
            notes_info,
            filter
          }
        })
    })
  )
}


export const generatePosts = async ({ api_key, proxy, account, random, params } = {}) => {

  const { offset = 0, limit = MAX_LIMIT, type, tag, reblog_info, notes_info, filter } = params || {}
  asserts(limit <= MAX_LIMIT, 'Posts > invalid limit')

  const length = await total({ api_key, proxy, account, params: { type, tag } })
  asserts(offset < length, 'Posts > invalid offset')

  return tiloop({
    length: length - offset,
    maxIncrement: limit,
    random: random,
    promisify: true,
    yielded: (indexedArr) =>
      posts({
        api_key,
        proxy,
        account,
        params: {
          offset: indexedArr[0] + offset,
          limit: indexedArr.length,
          type,
          tag,
          reblog_info,
          notes_info,
          filter
        }
      })
  })
}


export class Tumblr {

  constructor({ api_key, proxy } = {}) {
    requireAssert(api_key, proxy)
    this.api_key = api_key
    this.proxy = proxy
  }

  blog(account) {
    return blog({ api_key: this.api_key, proxy: this.proxy, account })
  }

  posts(account, params) {
    return posts({ api_key: this.api_key, proxy: this.proxy, account, params })
  }

  total(account, params) {
    return total({ api_key: this.api_key, proxy: this.proxy, account, params })
  }

  post(account, id, params) {
    return post({ api_key: this.api_key, proxy: this.proxy, account, id, params })
  }

  samplingPosts({ account, params, denom, maxLimit } = {}) {
    return samplingPosts({ api_key: this.api_key, proxy: this.proxy, account, params, denom, maxLimit })
  }

  samplingTags({ account, params, denom, maxLimit, proxy } = {}) {
    return samplingTags({ api_key: this.api_key, proxy: this.proxy, account, params, denom, maxLimit })
  }

  generatePosts({ account, params, random } = {}) {
    return generatePosts({ api_key: this.api_key, proxy: this.proxy, account, params, random })
  }
}

export default Tumblr