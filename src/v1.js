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

const PAGE_URL = (name) =>
	`https://${identifier(name)}`

const API_URL = (name) =>
	`${PAGE_URL(name)}/api/read/json`
	
const SEARCH_URL = (name, word) =>
	`${PAGE_URL(name)}/search/${word}`
	
const MAX_LIMIT = 50
const TIMEOUT = 5000

export const postTypes = ['quote', 'text', 'chat', 'photo', 'link', 'video', 'audio']

const jsonpInterface = (name, params, timeout = TIMEOUT) => {
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

export const search = (name, word, page, timeout = TIMEOUT) => {
  asserts(typeof word === 'string', 'required word')
  page = (typeof page === 'number' && page > 0) ? page : 1
  return jsonp(
    SEARCH_URL(name, word) + joinParams({ format: 'json', page }),
    timeout
  )
  .then(({ posts }) => posts)
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

export const generateSearch = async ({ name, word, timeout } = {}) => {
  
  let tempPosts = await search(name, word, 1, timeout)
  
  asserts(tempPosts.length !== 0, 'not found')
  
  const pageIterator = pageGenerator()
  
  return () => {
    
    const { value: page, done } = pageIterator.next()
    
    if (done) {
      const value = tempPosts
      if (tempPosts.length) tempPosts = []
      return Promise.resolve({ value, done })
    }
    
    return search(name, word, page + 1, timeout).then(posts => {
      pageIterator.next(!posts.length || posts.length !== tempPosts.length)
      const value = tempPosts
      tempPosts = posts
      return { value, done }
    })
  }
}

function* pageGenerator () {
  let page = 1
  let isReturn
  while (true) {
    if (!isReturn) {
      isReturn = yield page
      yield
    } else {
      return page
    }
    page++
  }
}