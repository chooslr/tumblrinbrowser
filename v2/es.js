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

var paramFilter = function paramFilter(value) {
  return Boolean(value) || typeof value === 'number'
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
  return (proxy || ORIGIN) + '/v2/blog/' + identifier(account)
}
var MAX_INCREMENT = 20
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

var postsInterface = function postsInterface(api_key, account, params, proxy) {
  var _ref2 = params || {},
    type = _ref2.type,
    tag = _ref2.tag,
    id = _ref2.id,
    limit = _ref2.limit,
    offset = _ref2.offset,
    reblog_info = _ref2.reblog_info,
    notes_info = _ref2.notes_info,
    filter = _ref2.filter

  asserts(typeof api_key === 'string')
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

var infoInterface = function infoInterface(api_key, account, proxy) {
  asserts(typeof api_key === 'string')
  return fetchInterface(
    API_URL(account, proxy) + '/info' + joinParams({ api_key: api_key }),
    { method: method, mode: mode }
  )
}

var _avatar = function _avatar(account) {
  var size =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 64
  return API_URL(account) + '/avatar/' + size
}
var _posts = function _posts(api_key, account, params, proxy) {
  return postsInterface(api_key, account, params, proxy).then(function(_ref3) {
    var posts = _ref3.posts
    return posts
  })
}
var _post = function _post(api_key, account, id) {
  var _ref4 =
      arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {},
    reblog_info = _ref4.reblog_info,
    notes_info = _ref4.notes_info

  var proxy = arguments[4]
  return postsInterface(
    api_key,
    account,
    { id: id, reblog_info: reblog_info, notes_info: notes_info },
    proxy
  ).then(function(_ref5) {
    var posts = _ref5.posts
    return posts[0]
  })
}
var _total = function _total(api_key, account) {
  var _ref6 =
      arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
    type = _ref6.type,
    tag = _ref6.tag

  var proxy = arguments[3]
  return postsInterface(
    api_key,
    account,
    { limit: 1, type: type, tag: tag },
    proxy
  ).then(function(_ref7) {
    var total_posts = _ref7.total_posts
    return total_posts
  })
}
var _blog = function _blog(api_key, account, proxy) {
  return infoInterface(api_key, account, proxy).then(function(_ref8) {
    var blog = _ref8.blog
    return blog
  })
}
var _samplingTags = function _samplingTags() {
  return _samplingPosts.apply(undefined, arguments).then(postsToTags)
}
var _samplingPosts = async function _samplingPosts() {
  var _ref9 =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    api_key = _ref9.api_key,
    account = _ref9.account,
    params = _ref9.params,
    denom = _ref9.denom,
    maxNum = _ref9.maxNum,
    proxy = _ref9.proxy

  denom = denom || SAMPLING_DENOM
  maxNum = maxNum || SAMPLING_MAX_NUM
  asserts(maxNum <= MAX_INCREMENT, 'invalid maxNum')

  var _ref10 = params || {},
    type = _ref10.type,
    tag = _ref10.tag,
    reblog_info = _ref10.reblog_info,
    notes_info = _ref10.notes_info,
    filter = _ref10.filter

  var length = await _total(api_key, account, { type: type, tag: tag }, proxy)
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
        return _posts(
          api_key,
          account,
          {
            offset: indexedArr[0],
            limit: indexedArr.length < maxNum ? indexedArr.length : maxNum,
            type: type,
            tag: tag,
            reblog_info: reblog_info,
            notes_info: notes_info,
            filter: filter
          },
          proxy
        )
      }
    })
  )
}
var _Timeline = async function _Timeline() {
  var _ref11 =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    api_key = _ref11.api_key,
    account = _ref11.account,
    random = _ref11.random,
    params = _ref11.params,
    proxy = _ref11.proxy

  var _ref12 = params || {},
    _ref12$offset = _ref12.offset,
    offset = _ref12$offset === undefined ? 0 : _ref12$offset,
    _ref12$limit = _ref12.limit,
    limit = _ref12$limit === undefined ? MAX_INCREMENT : _ref12$limit,
    type = _ref12.type,
    tag = _ref12.tag,
    reblog_info = _ref12.reblog_info,
    notes_info = _ref12.notes_info,
    filter = _ref12.filter

  asserts(limit <= MAX_INCREMENT, 'Posts > invalid limit')

  var length = await _total(api_key, account, { type: type, tag: tag }, proxy)
  asserts(offset < length, 'Posts > invalid offset')

  return tiloop({
    length: length - offset,
    maxIncrement: limit,
    random: random,
    promisify: true,
    yielded: function yielded(indexedArr) {
      return _posts(
        api_key,
        account,
        {
          offset: indexedArr[0] + offset,
          limit: indexedArr.length,
          type: type,
          tag: tag,
          reblog_info: reblog_info,
          notes_info: notes_info,
          filter: filter
        },
        proxy
      )
    }
  })
}
var Tumblr = (function() {
  function Tumblr(api_key, proxy) {
    classCallCheck(this, Tumblr)

    asserts(api_key)
    this.api_key = api_key
    this.proxy = proxy
  }

  createClass(Tumblr, [
    {
      key: 'avatar',
      value: function avatar(account, size) {
        return _avatar(account, size)
      }
    },
    {
      key: 'posts',
      value: function posts(api_key, account, params, proxy) {
        return _posts(this.api_key, account, params, proxy || this.proxy)
      }
    },
    {
      key: 'post',
      value: function post(api_key, account, id, params, proxy) {
        return _post(this.api_key, account, id, params, proxy || this.proxy)
      }
    },
    {
      key: 'total',
      value: function total(account, params, proxy) {
        return _total(this.api_key, account, params, proxy || this.proxy)
      }
    },
    {
      key: 'blog',
      value: function blog(account, proxy) {
        return _blog(this.api_key, account, proxy || this.proxy)
      }
    },
    {
      key: 'samplingPosts',
      value: function samplingPosts(_ref13) {
        var account = _ref13.account,
          params = _ref13.params,
          denom = _ref13.denom,
          maxNum = _ref13.maxNum,
          proxy = _ref13.proxy

        return _samplingPosts({
          api_key: this.api_key,
          account: account,
          params: params,
          denom: denom,
          maxNum: maxNum,
          proxy: proxy || this.proxy
        })
      }
    },
    {
      key: 'samplingTags',
      value: function samplingTags(_ref14) {
        var account = _ref14.account,
          params = _ref14.params,
          denom = _ref14.denom,
          maxNum = _ref14.maxNum,
          proxy = _ref14.proxy

        return _samplingTags({
          api_key: this.api_key,
          account: account,
          params: params,
          denom: denom,
          maxNum: maxNum,
          proxy: proxy || this.proxy
        })
      }
    },
    {
      key: 'Timeline',
      value: function Timeline(_ref15) {
        var account = _ref15.account,
          params = _ref15.params,
          proxy = _ref15.proxy,
          random = _ref15.random

        return _Timeline({
          api_key: this.api_key,
          account: account,
          params: params,
          proxy: proxy,
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
  _avatar as avatar,
  _posts as posts,
  _post as post,
  _total as total,
  _blog as blog,
  _samplingTags as samplingTags,
  _samplingPosts as samplingPosts,
  _Timeline as Timeline,
  Tumblr
}
