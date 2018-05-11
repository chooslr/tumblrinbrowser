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
const API_URL = (account, proxy) => `${proxy || ORIGIN}/v2/blog/${identifier(account)}`
const MAX_INCREMENT = 20
const method = 'GET'
const mode = 'cors'

export const postTypes = ['quote', 'text', 'chat', 'photo', 'link', 'video', 'audio', 'answer']

export const avatarSizes = [16, 24, 30, 40, 48, 64, 96, 128, 512]

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

const postsInterface = (api_key, account, params, proxy) => {
  const { type, tag, id, limit, offset, reblog_info, notes_info, filter } = params || {}
  asserts(typeof api_key === 'string')
  return fetchInterface(
    `${API_URL(account, proxy)}/posts` + joinParams({ api_key, type, tag, id, limit, offset, reblog_info, notes_info, filter }),
    { method, mode }
  )
}

const infoInterface = (api_key, account, proxy) => {
  asserts(typeof api_key === 'string')
  return fetchInterface(
    `${API_URL(account, proxy)}/info` + joinParams({ api_key }),
    { method, mode }
  )
}


export const avatar = (account, size = 64) => `${API_URL(account)}/avatar/${size}`

export const posts = (api_key, account, params, proxy) =>
  postsInterface(api_key, account, params, proxy)
  .then(({ posts }) => posts)

export const post = (api_key, account, id, { reblog_info, notes_info } = {}, proxy) =>
  postsInterface(api_key, account, { id, reblog_info, notes_info }, proxy)
  .then(({ posts }) => posts[0])

export const total = (api_key, account, { type, tag } = {}, proxy) =>
  postsInterface(api_key, account, { limit: 1, type, tag }, proxy)
  .then(({ total_posts }) => total_posts)

export const blog = (api_key, account, proxy) =>
  infoInterface(api_key, account, proxy)
  .then(({ blog }) => blog)


export const samplingTags = (...arg) => samplingPosts(...arg).then(postsToTags)

export const samplingPosts = async ({ api_key, account, params, denom, maxNum, proxy } = {}) => {

  denom = denom || SAMPLING_DENOM
  maxNum = maxNum || SAMPLING_MAX_NUM
  asserts(maxNum <= MAX_INCREMENT, 'invalid maxNum')

  const { type, tag, reblog_info, notes_info, filter } = params || {}

  const length = await total(api_key, account, { type, tag }, proxy)
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
        posts(
          api_key,
          account,
          {
            offset: indexedArr[0],
            limit: indexedArr.length < maxNum ? indexedArr.length : maxNum,
            type,
            tag,
            reblog_info,
            notes_info,
            filter
          },
          proxy
        )
    })
  )
}



export const Timeline = async ({ api_key, account, random, params, proxy } = {}) => {

  const { offset = 0, limit = MAX_INCREMENT, type, tag, reblog_info, notes_info, filter } = params || {}
  asserts(limit <= MAX_INCREMENT, 'Posts > invalid limit')

  const length = await total(api_key, account, { type, tag }, proxy)
  asserts(offset < length, 'Posts > invalid offset')

  return tiloop({
    length: length - offset,
    maxIncrement: limit,
    random: random,
    promisify: true,
    yielded: (indexedArr) =>
      posts(
        api_key,
        account,
        {
          offset: indexedArr[0] + offset,
          limit: indexedArr.length,
          type,
          tag,
          reblog_info,
          notes_info,
          filter
        },
        proxy
      )
  })
}

/* class */
export class Tumblr {
  constructor(api_key, proxy) {
    asserts(api_key)
    this.api_key = api_key
    this.proxy = proxy
  }

  avatar(account, size) {
    return avatar(account, size)
  }

  posts(api_key, account, params, proxy) {
    return posts(this.api_key, account, params, proxy || this.proxy)
  }

  post(api_key, account, id, params, proxy) {
    return post(this.api_key, account, id, params, proxy || this.proxy)
  }

  total(account, params, proxy) {
    return total(this.api_key, account, params, proxy || this.proxy)
  }

  blog(account, proxy) {
    return blog(this.api_key, account, proxy || this.proxy)
  }

  samplingPosts({ account, params, denom, maxNum, proxy }) {
    return samplingPosts({
      api_key: this.api_key,
      account,
      params,
      denom,
      maxNum,
      proxy: proxy || this.proxy
    })
  }

  samplingTags({ account, params, denom, maxNum, proxy }) {
    return samplingTags({
      api_key: this.api_key,
      account,
      params,
      denom,
      maxNum,
      proxy: proxy || this.proxy
    })
  }

  Timeline({ account, params, proxy, random }) {
    return Timeline({
      api_key: this.api_key,
      account,
      params,
      proxy,
      random
    })
  }
}

export default Tumblr