# tumblrinbrowser

[![npm](https://img.shields.io/npm/v/tumblrinbrowser.svg?style=flat-square)](https://www.npmjs.com/package/tumblrinbrowser)
[![npm](https://img.shields.io/npm/dm/tumblrinbrowser.svg?style=flat-square)](https://www.npmjs.com/package/tumblrinbrowser)
[![Build Status](https://img.shields.io/travis/kthjm/tumblrinbrowser.svg?style=flat-square)](https://travis-ci.org/kthjm/tumblrinbrowser)
[![Coverage Status](https://img.shields.io/codecov/c/github/kthjm/tumblrinbrowser.svg?style=flat-square)](https://codecov.io/github/kthjm/tumblrinbrowser)

[tumblr/tumblr.js](https://github.com/tumblr/tumblr.js/)
> Due to CORS restrictions, you're going to have a really hard time using this library in the browser. Although GET endpoints on the Tumblr API support JSONP, this library is not intended for in-browser use. Sorry!

The unofficial JavaScript client library for both Tumblr API [v2](http://www.tumblr.com/docs/api/v2) and [v1](https://www.tumblr.com/docs/en/api/v1) intended for use in browser.

- [`window.tumblrV2`](https://cdn.jsdelivr.net/npm/tumblrinbrowser/v2/min.js)
- [`window.tumblrV1`](https://cdn.jsdelivr.net/npm/tumblrinbrowser/v1/min.js)

## v2
```js
import Tumblr from 'tumblrinbrowser'

const tumblr = new Tumblr({ api_key, proxy })
```

### `new Tumblr({ api_key, proxy })`
Required at least one either.

#### `.blog(account)`
result: `Promise<Blog>`

#### `.posts(account[, params])`
result: `Promise<Post[]>`
##### params
- `type`
- `tag`
- `id`
- `limit`
- `offset`
- `reblog_info`
- `notes_info`
- `filter`

#### `.total(account[, params])`
result: `Promise<number>`
##### params
- `type`
- `tag`

#### `.post(account, id[, params])`
result: `Promise<Post>`
##### params
- `reblog_info`
- `notes_info`

#### `.samplingPosts(options)` / `.samplingTags(options)`
result: `Promise<Post[]>` / `Promise<Tag[]>`
##### options
- `account`
- `denom`
- `maxLimit`
- `params`

#### `.Timeline(options)`
result: `Promise<TimelineFn>`
##### options
- `account`
- `random`
- `params`

```js
const timeline = await tumblr.Timeline({ account })
const { done, value: posts } = await timeline()
const { done, value: posts } = await timeline()
```

### modules
```js
import * as v2 from 'tumblrinbrowser'

const url = v2.avatar(account[, size])

const blog = await v2.blog({ api_key, proxy, account })
const posts = await v2.posts({ api_key, proxy, account, params })
const total = await v2.total({ api_key, proxy, account, params })
const post = await v2.post({ api_key, proxy, account, id, params })

const posts = await v2.samplingPosts({ api_key, proxy, account, denom, maxLimit, params })
const tags = await v2.samplingTags({ api_key, proxy, account, denom, maxLimit, params })

const timeline = await v2.Timeline({ api_key, proxy, account, random, params })
```

## v1
```js
import * as v1 from 'tumblrinbrowser/v1'

const blog = await v1.blog(account[, timeout])
const posts = await v1.posts(account[, params, timeout])
const total = await v1.total(account[, params, timeout])
const post = await v1.post(account, id[, params, timeout])

const posts = await v1.samplingPosts({ account, params, denom, maxLimit, timeout })
const tags = await v1.samplingTags({ account, params, denom, maxLimit, timeout })

const timeline = await v1.Timeline({ account, params, random, timeout })
```

## License
MIT (http://opensource.org/licenses/MIT)
