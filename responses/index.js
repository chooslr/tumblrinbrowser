import * as v2 from '../rewired/v2.js'
import * as v1 from '../rewired/v1.js'
import { outputJson } from 'fs-extra'
import { join } from 'path'

export const outpath = (type) => join(__dirname, `${type}.json`)
export const account = 'kthjm'
export const spaces = '  '

export const extractZero = ([zero]) => zero

export const createCommon = (posts) => {
  const result = {}
  const properties = new Map()

  posts.forEach(post =>
    Object.keys(post).forEach(key =>
      !properties.has(key) &&
      properties.set(key, post[key])
    )
  )

  ;[...properties.keys()]
  .filter(key => posts.every(post => Object.keys(post).includes(key)))
  .forEach(key => result[key] = properties.get(key))

  return result
}

const createV2 = async () => {

  const arg = [process.env.CONSUMER_KEY, account]

  const fetchPostByType = (type) => v2.posts(...arg, { limit: 1, type }).then(extractZero)

  const quote = await fetchPostByType('quote')
  const text = await fetchPostByType('text')
  const chat = await fetchPostByType('chat')
  const photo = await fetchPostByType('photo')
  const link = await fetchPostByType('link')
  const video = await fetchPostByType('video')
  const audio = await fetchPostByType('audio')
  const answer = await fetchPostByType('answer')

  const map = { quote, text, chat, photo, link, video, audio, answer }

  const HoExtractExclude = (excludes) =>
    (post) => {
      const result = {}
      const excludes_keys = Array.isArray(excludes) ? excludes : excludes(post)

      Object.keys(post)
      .filter(key =>
        !excludes_keys.includes(key)
      )
      .forEach(key =>
        result[key] = post[key]
      )

      return result
    }

  const extractExclude = HoExtractExclude(({ type }) => Object.keys(map[type]))

  const fetchPostWithExcludes = (key, extractExclude) =>
    v2.posts(...arg, { limit: 1, [key]: true })
    .then(extractZero)
    .then(extractExclude)

  const reblog_info = await fetchPostWithExcludes('reblog_info', extractExclude)
  const notes_info = await fetchPostWithExcludes('notes_info', extractExclude)
  notes_info.notes = notes_info.notes.slice(0, 4)

  const posts = Object.values(map)

  const common = createCommon(posts)

  Object.keys(common).forEach(key => posts.forEach(post => delete post[key]))

  ;['reblog', 'trail'].forEach(key => posts.forEach(post => {
    common[key] = common[key] || post[key]
    return delete post[key]
  }))

  const blog = await v2.blog(...arg)

  return { blog, post: { quote, text, chat, photo, link, video, audio, answer, common, reblog_info, notes_info } }
}

const createV1 = async () => {

  const postByType = (type) =>
    v1.posts(account, { num: 1, type })
    .then(extractZero)

  const quote = await postByType('quote')
  const text = await postByType('text')
  const chat = await postByType('chat')
  const photo = await postByType('photo')
  const link = await postByType('link')
  const video = await postByType('video')
  const audio = await postByType('audio')

  const posts = [ quote, text, chat, photo, link, video, audio ]
  const common = createCommon(posts)
  Object.keys(common).forEach(key => posts.forEach(post => delete post[key]))

  const reblog_info = {}
  posts.forEach(post =>
    Object
    .keys(post)
    .filter(key => key.includes('reblogged'))
    .forEach(rebloggedKey => {
      reblog_info[rebloggedKey] = post[rebloggedKey]
      delete post[rebloggedKey]
    })
  )

  const blog = await v1.blog(account)

  return { blog, post: { quote, 'text/regular': text, 'chat/conversation': chat, photo, link, video, audio, common, reblog_info } }
}

(async () => {
  const v2 = await createV2()
  const v1 = await createV1()
  await outputJson(outpath('v2'), v2, { spaces })
  await outputJson(outpath('v1'), v1, { spaces })
  return
})()
.catch(err => console.error(err))