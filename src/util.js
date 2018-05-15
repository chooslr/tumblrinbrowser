export const SAMPLING_DENOM = 4
export const SAMPLING_MAX_NUM = 3

export const identifier = name => `${name}.tumblr.com`

export const throws = (message) => { throw new Error(message) }

export const asserts = (condition, message) => !condition && throws(message)

const paramFilter = (value) => Boolean(value) || typeof value === 'number'

export const joinParams = (params = {}) => {
  const valids = Object.entries(params).filter(([key,value]) => paramFilter(value))
  return valids.length
    ? '?' + valids.map(([key,value]) => `${key}=${value}`).join('&')
    : ''
}

export const recursiveAddPostTillDone = (feed, set = new Set()) =>
  feed().then(({ done, value: posts }) => {
    posts.forEach(post => set.add(post))
    return done ? [...set.values()] : recursiveAddPostTillDone(feed, set)
  })

const arrToUniques = (arr) => [...new Set(arr).values()]

export const postsToTags = (posts) =>
  arrToUniques(
    [].concat(...
      posts
      .filter(({ tags }) => tags)
      .map(({ tags }) => tags)
    )
  )