# tumblrinbrowser

[tumblr/tumblr.js](https://github.com/tumblr/tumblr.js/)
> Due to CORS restrictions, you're going to have a really hard time using this library in the browser. Although GET endpoints on the Tumblr API support JSONP, this library is not intended for in-browser use. Sorry!

### v2
```js
import * as v2 from 'tumblrinbrowser'

const posts = await v2.posts(api_key, account[, params, proxy])
const post = await v2.post(api_key, account, id[, params, proxy])
const total = await v2.total(api_key, account[, params, proxy])
const blog = await v2.blog(api_key, account[, proxy])
const url = v2.avatar(account[, size])

const posts = await v2.samplingPosts({ api_key, account, params, denom, maxNum })
const tags = await v2.samplingTags({ api_key, account, params, denom, maxNum })

const timeline = await v2.Timeline({ api_key, account, params, random, proxy })

const tumblr = new v2.Tumblr(api_key[, proxy]) // has above methods.
```

### v1
```js
import * as v1 from 'tumblrinbrowser/v1'

const posts = await v1.posts(account[, params])
const post = await v1.post(account, id[, params])
const total = await v1.total(account[, params])
const blog = await v1.blog(account)

const posts = await v1.samplingPosts({ account, params, denom, maxNum })
const tags = await v1.samplingTags({ account, params, denom, maxNum })

const timeline = await v1.Timeline({ account, params, random })
```