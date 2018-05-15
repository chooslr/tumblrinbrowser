import regeneratorRuntime from 'regenerator-runtime'
import jsonp from 'jsonp-simple'
import tiloop from 'tiloop'
import {
  identifier,
  joinParams,
  asserts,
  SAMPLING_DENOM,
  SAMPLING_MAX_NUM,
  recursiveAddPostTillDone,
  postsToTags
} from './util.js'

const API_URL = name => `https://${identifier(name)}/api/read/json`
const MAX_LIMIT = 50

export const postTypes = ['quote', 'text', 'chat', 'photo', 'link', 'video', 'audio']

const jsonpInterface = (name, params, timeout = 5000) => {
  asserts(typeof name === 'string', 'required name')
  const { start, num, type, tag, id, filter } = params || {}
  return jsonp(
    API_URL(name) + joinParams({ start, num, type, tagged: tag, id, filter }),
    timeout
  )
}

export const blog = (name, timeout) =>
  jsonpInterface(name, { num: 0 }, timeout)
  .then(({ tumblelog }) => tumblelog)

export const posts = (...arg) =>
  jsonpInterface(...arg)
  .then(({ posts }) => posts)

export const total = (name, params, timeout) => {
  const { type, tag } = params || {}
  return jsonpInterface(name, { num: 0, type, tag }, timeout)
  .then(res => +res['posts-total'])
}

export const post = (name, id, timeout) => {
  asserts(typeof id === 'string' || typeof id === 'number', 'required id')
  return jsonpInterface(name, { id }, timeout)
  .then(({ posts }) => posts[0])
}


export const samplingTags = (...arg) => samplingPosts(...arg).then(postsToTags)

export const samplingPosts = async ({ name, params, denom, maxLimit, timeout } = {}) => {

  denom = denom || SAMPLING_DENOM
  maxLimit = maxLimit || SAMPLING_MAX_NUM
  asserts(maxLimit <= MAX_LIMIT, 'invalid maxLimit')

  const { type, tag, filter } = params || {}

  const length = await total(name, { type, tag })
  asserts(length > 0, 'sampling name has no posts')

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
          name,
          {
            start: indexedArr[0],
            num: indexedArr.length < maxLimit ? indexedArr.length : maxLimit,
            type,
            tag,
            filter
          },
          timeout
        )
    })
  )
}


export const generatePosts = async ({ name, random, params, timeout } = {}) => {

  const { start = 0, num = 20, type, tag, filter } = params || {}
  asserts(num <= MAX_LIMIT, 'invalid num')

  const length = await total(name, { type, tag })
  asserts(start < length, 'invalid start')

  return tiloop({
    length: length - start,
    maxIncrement: num,
    random: random,
    promisify: true,
    yielded: (indexedArr) =>
      posts(
        name,
        {
          start: indexedArr[0] + start,
          num: indexedArr.length,
          type,
          tag,
          filter
        },
        timeout
      )
  })
}