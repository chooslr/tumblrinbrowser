# tumblrinbrowser

[![npm](https://img.shields.io/npm/v/tumblrinbrowser.svg?longCache=true&style=flat-square)](https://www.npmjs.com/package/tumblrinbrowser)
[![npm](https://img.shields.io/npm/dm/tumblrinbrowser.svg?longCache=true&style=flat-square)](https://www.npmjs.com/package/tumblrinbrowser)
[![Build Status](https://img.shields.io/travis/kthjm/tumblrinbrowser.svg?longCache=true&style=flat-square)](https://travis-ci.org/kthjm/tumblrinbrowser)
[![Coverage Status](https://img.shields.io/codecov/c/github/kthjm/tumblrinbrowser.svg?longCache=true&style=flat-square)](https://codecov.io/github/kthjm/tumblrinbrowser)

> [tumblr/tumblr.js](https://github.com/tumblr/tumblr.js/)
>
> Due to CORS restrictions, you're going to have a really hard time using this library in the browser. Although GET endpoints on the Tumblr API support JSONP, this library is not intended for in-browser use. Sorry!

The unofficial JavaScript client library for both Tumblr API [v2](http://www.tumblr.com/docs/api/v2) and [v1](https://www.tumblr.com/docs/en/api/v1) intended for use in browser. (splited from [**chooslr**](https://chooslr.com/) that is tumblr client app)

## Installation

### cdn
- [`window.tumblrV2`](https://cdn.jsdelivr.net/npm/tumblrinbrowser/v2/min.js)
- [`window.tumblrV1`](https://cdn.jsdelivr.net/npm/tumblrinbrowser/v1/min.js)

### npm
```shell
yarn add tumblrinbrowser
```


## v2
```js
import Tumblr from 'tumblrinbrowser'

const tumblr = new Tumblr({ api_key, proxy })
```

### `new Tumblr({ api_key, proxy })`
Required at least one either.

#### `.blog(name)`
result: `Promise<Blog>`

#### `.posts(name[, params])`
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

#### `.total(name[, params])`
result: `Promise<number>`
##### params
- `type`
- `tag`

#### `.post(name, id[, params])`
result: `Promise<Post>`
##### params
- `reblog_info`
- `notes_info`

#### `.samplingPosts(options)` / `.samplingTags(options)`
result: `Promise<Post[]>` / `Promise<Tag[]>`
##### options
- `name`
- `denom`
- `maxLimit`
- `params`

#### `.generatePosts(options)`
```js
const supply = await tumblr.generatePosts({ name })
const { done, value: posts } = await supply()
const { done, value: posts } = await supply()
```
result: `Promise<SupplyFn>` ([`tiloop`](https://github.com/kthjm/tiloop)'s)
##### options
- `name`
- `random`
- `params`


### modules
```js
import * as v2 from 'tumblrinbrowser'

const url = v2.avatar(name[, size])

const blog = await v2.blog({ api_key, proxy, name })
const posts = await v2.posts({ api_key, proxy, name, params })
const total = await v2.total({ api_key, proxy, name, params })
const post = await v2.post({ api_key, proxy, name, id, params })

const posts = await v2.samplingPosts({ api_key, proxy, name, denom, maxLimit, params })
const tags = await v2.samplingTags({ api_key, proxy, name, denom, maxLimit, params })

const supply = await v2.generatePosts({ api_key, proxy, name, random, params })
```

## v1
```js
import * as v1 from 'tumblrinbrowser/v1'

const blog = await v1.blog(name[, timeout])
const posts = await v1.posts(name[, params, timeout])
const total = await v1.total(name[, params, timeout])
const post = await v1.post(name, id[, params, timeout])

const posts = await v1.samplingPosts({ name, params, denom, maxLimit, timeout })
const tags = await v1.samplingTags({ name, params, denom, maxLimit, timeout })

const supply = await v1.generatePosts({ name, params, random, timeout })
```

## License
MIT (http://opensource.org/licenses/MIT)
