import tiloop from 'tiloop'

var classCallCheck = function(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function')
  }
}

var createClass = (function() {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i]
      descriptor.enumerable = descriptor.enumerable || false
      descriptor.configurable = true
      if ('value' in descriptor) descriptor.writable = true
      Object.defineProperty(target, descriptor.key, descriptor)
    }
  }

  return function(Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps)
    if (staticProps) defineProperties(Constructor, staticProps)
    return Constructor
  }
})()

var slicedToArray = (function() {
  function sliceIterator(arr, i) {
    var _arr = []
    var _n = true
    var _d = false
    var _e = undefined

    try {
      for (
        var _i = arr[Symbol.iterator](), _s;
        !(_n = (_s = _i.next()).done);
        _n = true
      ) {
        _arr.push(_s.value)

        if (i && _arr.length === i) break
      }
    } catch (err) {
      _d = true
      _e = err
    } finally {
      try {
        if (!_n && _i['return']) _i['return']()
      } finally {
        if (_d) throw _e
      }
    }

    return _arr
  }

  return function(arr, i) {
    if (Array.isArray(arr)) {
      return arr
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i)
    } else {
      throw new TypeError(
        'Invalid attempt to destructure non-iterable instance'
      )
    }
  }
})()

var toConsumableArray = function(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++)
      arr2[i] = arr[i]

    return arr2
  } else {
    return Array.from(arr)
  }
}

var SAMPLING_DENOM = 4
var SAMPLING_MAX_NUM = 3

var identifier = function identifier(account) {
  return account + '.tumblr.com'
}

var throws = function throws(message) {
  throw new Error(message)
}

var asserts = function asserts(condition, message) {
  return !condition && throws(message)
}

var paramFilter = function paramFilter(value) {
  return Boolean(value) || typeof value === 'number'
}

var joinParams = function joinParams() {
  var params =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}

  var valids = Object.entries(params).filter(function(_ref) {
    var _ref2 = slicedToArray(_ref, 2),
      key = _ref2[0],
      value = _ref2[1]

    return paramFilter(value)
  })
  return valids.length
    ? '?' +
        valids
          .map(function(_ref3) {
            var _ref4 = slicedToArray(_ref3, 2),
              key = _ref4[0],
              value = _ref4[1]

            return key + '=' + value
          })
          .join('&')
    : ''
}

var recursiveAddPostTillDone = function recursiveAddPostTillDone(feed) {
  var set$$1 =
    arguments.length > 1 && arguments[1] !== undefined
      ? arguments[1]
      : new Set()
  return feed().then(function(_ref5) {
    var done = _ref5.done,
      posts = _ref5.value

    posts.forEach(function(post) {
      return set$$1.add(post)
    })
    return done
      ? [].concat(toConsumableArray(set$$1.values()))
      : recursiveAddPostTillDone(feed, set$$1)
  })
}

var arrToUniques = function arrToUniques(arr) {
  return [].concat(toConsumableArray(new Set(arr).values()))
}

var postsToTags = function postsToTags(posts) {
  var _ref6

  return arrToUniques(
    (_ref6 = []).concat.apply(
      _ref6,
      toConsumableArray(
        posts
          .filter(function(_ref7) {
            var tags = _ref7.tags
            return tags
          })
          .map(function(_ref8) {
            var tags = _ref8.tags
            return tags
          })
      )
    )
  )
}

var ORIGIN = 'https://api.tumblr.com'
var API_URL = function API_URL(account, proxy) {
  return (
    (proxy ? pathformat(proxy) : ORIGIN) + '/v2/blog/' + identifier(account)
  )
}
var pathformat = function pathformat(path) {
  return path[path.length - 1] === '/' ? path.slice(0, path.length - 1) : path
}
var MAX_LIMIT = 20
var method = 'GET'
var mode = 'cors'

var postTypes = [
  'quote',
  'text',
  'chat',
  'photo',
  'link',
  'video',
  'audio',
  'answer'
]

var avatarSizes = [16, 24, 30, 40, 48, 64, 96, 128, 512]

var avatar = function avatar(account) {
  var size =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 64
  return API_URL(account) + '/avatar/' + size
}

var isSuccess = function isSuccess(status) {
  return status === 200 || status === 201
}

var fetchInterface = function fetchInterface() {
  return fetch
    .apply(undefined, arguments)
    .then(function(res) {
      return isSuccess(res.status) ? res.json() : throws(res.statusText)
    })
    .then(function(_ref) {
      var _ref$meta = _ref.meta,
        status = _ref$meta.status,
        msg = _ref$meta.msg,
        response = _ref.response
      return isSuccess(status) ? response : throws(msg)
    })
}

var requireAssert = function requireAssert(api_key, proxy) {
  return asserts(
    typeof api_key === 'string' || typeof proxy === 'string',
    'required api_key || proxy'
  )
}

var accountAssert = function accountAssert(account) {
  return asserts(typeof account === 'string', 'required account')
}

var postsInterface = function postsInterface() {
  var _ref2 =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    api_key = _ref2.api_key,
    proxy = _ref2.proxy,
    account = _ref2.account,
    params = _ref2.params

  requireAssert(api_key, proxy)
  accountAssert(account)

  var _ref3 = params || {},
    type = _ref3.type,
    tag = _ref3.tag,
    id = _ref3.id,
    limit = _ref3.limit,
    offset = _ref3.offset,
    reblog_info = _ref3.reblog_info,
    notes_info = _ref3.notes_info,
    filter = _ref3.filter

  return fetchInterface(
    API_URL(account, proxy) +
      '/posts' +
      joinParams({
        api_key: api_key,
        type: type,
        tag: tag,
        id: id,
        limit: limit,
        offset: offset,
        reblog_info: reblog_info,
        notes_info: notes_info,
        filter: filter
      }),
    { method: method, mode: mode }
  )
}

var infoInterface = function infoInterface() {
  var _ref4 =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    api_key = _ref4.api_key,
    proxy = _ref4.proxy,
    account = _ref4.account

  requireAssert(api_key, proxy)
  accountAssert(account)

  return fetchInterface(
    API_URL(account, proxy) + '/info' + joinParams({ api_key: api_key }),
    { method: method, mode: mode }
  )
}

var _blog = function _blog(options) {
  return infoInterface(options).then(function(_ref5) {
    var blog = _ref5.blog
    return blog
  })
}
var _posts = function _posts(options) {
  return postsInterface(options).then(function(_ref6) {
    var posts = _ref6.posts
    return posts
  })
}
var _total = function _total() {
  var _ref7 =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    api_key = _ref7.api_key,
    proxy = _ref7.proxy,
    account = _ref7.account,
    params = _ref7.params

  var _ref8 = params || {},
    type = _ref8.type,
    tag = _ref8.tag

  return postsInterface({
    api_key: api_key,
    proxy: proxy,
    account: account,
    params: { limit: 1, type: type, tag: tag }
  }).then(function(_ref9) {
    var total_posts = _ref9.total_posts
    return total_posts
  })
}
var _post = function _post() {
  var _ref10 =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    api_key = _ref10.api_key,
    proxy = _ref10.proxy,
    account = _ref10.account,
    id = _ref10.id,
    params = _ref10.params

  asserts(typeof id === 'string' || typeof id === 'number', 'required id')

  var _ref11 = params || {},
    reblog_info = _ref11.reblog_info,
    notes_info = _ref11.notes_info

  return postsInterface({
    api_key: api_key,
    proxy: proxy,
    account: account,
    params: { id: id, reblog_info: reblog_info, notes_info: notes_info }
  }).then(function(_ref12) {
    var posts = _ref12.posts
    return posts[0]
  })
}
var _samplingTags = function _samplingTags(options) {
  return _samplingPosts(options).then(postsToTags)
}
var _samplingPosts = async function _samplingPosts() {
  var _ref13 =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    api_key = _ref13.api_key,
    proxy = _ref13.proxy,
    account = _ref13.account,
    params = _ref13.params,
    denom = _ref13.denom,
    maxLimit = _ref13.maxLimit

  denom = denom || SAMPLING_DENOM
  maxLimit = maxLimit || SAMPLING_MAX_NUM
  asserts(maxLimit <= MAX_LIMIT, 'invalid maxLimit')

  var _ref14 = params || {},
    type = _ref14.type,
    tag = _ref14.tag,
    reblog_info = _ref14.reblog_info,
    notes_info = _ref14.notes_info,
    filter = _ref14.filter

  var length = await _total({
    api_key: api_key,
    proxy: proxy,
    account: account,
    params: { type: type, tag: tag }
  })
  asserts(length > 0, 'sampling account has no posts')

  var maxIncrement = Math.floor(length / denom)
  asserts(maxIncrement > 0, 'invalid denom')

  return recursiveAddPostTillDone(
    tiloop({
      length: length,
      maxIncrement: maxIncrement,
      random: true,
      promisify: true,
      yielded: function yielded(indexedArr) {
        return _posts({
          api_key: api_key,
          proxy: proxy,
          account: account,
          params: {
            offset: indexedArr[0],
            limit: indexedArr.length < maxLimit ? indexedArr.length : maxLimit,
            type: type,
            tag: tag,
            reblog_info: reblog_info,
            notes_info: notes_info,
            filter: filter
          }
        })
      }
    })
  )
}
var _generatePosts = async function _generatePosts() {
  var _ref15 =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    api_key = _ref15.api_key,
    proxy = _ref15.proxy,
    account = _ref15.account,
    random = _ref15.random,
    params = _ref15.params

  var _ref16 = params || {},
    _ref16$offset = _ref16.offset,
    offset = _ref16$offset === undefined ? 0 : _ref16$offset,
    _ref16$limit = _ref16.limit,
    limit = _ref16$limit === undefined ? MAX_LIMIT : _ref16$limit,
    type = _ref16.type,
    tag = _ref16.tag,
    reblog_info = _ref16.reblog_info,
    notes_info = _ref16.notes_info,
    filter = _ref16.filter

  asserts(limit <= MAX_LIMIT, 'Posts > invalid limit')

  var length = await _total({
    api_key: api_key,
    proxy: proxy,
    account: account,
    params: { type: type, tag: tag }
  })
  asserts(offset < length, 'Posts > invalid offset')

  return tiloop({
    length: length - offset,
    maxIncrement: limit,
    random: random,
    promisify: true,
    yielded: function yielded(indexedArr) {
      return _posts({
        api_key: api_key,
        proxy: proxy,
        account: account,
        params: {
          offset: indexedArr[0] + offset,
          limit: indexedArr.length,
          type: type,
          tag: tag,
          reblog_info: reblog_info,
          notes_info: notes_info,
          filter: filter
        }
      })
    }
  })
}
var Tumblr = (function() {
  function Tumblr() {
    var _ref17 =
        arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      api_key = _ref17.api_key,
      proxy = _ref17.proxy

    classCallCheck(this, Tumblr)

    requireAssert(api_key, proxy)
    this.api_key = api_key
    this.proxy = proxy
  }

  createClass(Tumblr, [
    {
      key: 'blog',
      value: function blog(account) {
        return _blog({
          api_key: this.api_key,
          proxy: this.proxy,
          account: account
        })
      }
    },
    {
      key: 'posts',
      value: function posts(account, params) {
        return _posts({
          api_key: this.api_key,
          proxy: this.proxy,
          account: account,
          params: params
        })
      }
    },
    {
      key: 'total',
      value: function total(account, params) {
        return _total({
          api_key: this.api_key,
          proxy: this.proxy,
          account: account,
          params: params
        })
      }
    },
    {
      key: 'post',
      value: function post(account, id, params) {
        return _post({
          api_key: this.api_key,
          proxy: this.proxy,
          account: account,
          id: id,
          params: params
        })
      }
    },
    {
      key: 'samplingPosts',
      value: function samplingPosts() {
        var _ref18 =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : {},
          account = _ref18.account,
          params = _ref18.params,
          denom = _ref18.denom,
          maxLimit = _ref18.maxLimit

        return _samplingPosts({
          api_key: this.api_key,
          proxy: this.proxy,
          account: account,
          params: params,
          denom: denom,
          maxLimit: maxLimit
        })
      }
    },
    {
      key: 'samplingTags',
      value: function samplingTags() {
        var _ref19 =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : {},
          account = _ref19.account,
          params = _ref19.params,
          denom = _ref19.denom,
          maxLimit = _ref19.maxLimit,
          proxy = _ref19.proxy

        return _samplingTags({
          api_key: this.api_key,
          proxy: this.proxy,
          account: account,
          params: params,
          denom: denom,
          maxLimit: maxLimit
        })
      }
    },
    {
      key: 'generatePosts',
      value: function generatePosts() {
        var _ref20 =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : {},
          account = _ref20.account,
          params = _ref20.params,
          random = _ref20.random

        return _generatePosts({
          api_key: this.api_key,
          proxy: this.proxy,
          account: account,
          params: params,
          random: random
        })
      }
    }
  ])
  return Tumblr
})()

export default Tumblr
export {
  postTypes,
  avatarSizes,
  avatar,
  _blog as blog,
  _posts as posts,
  _total as total,
  _post as post,
  _samplingTags as samplingTags,
  _samplingPosts as samplingPosts,
  _generatePosts as generatePosts,
  Tumblr
}
