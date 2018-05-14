'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

function _interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex
}

var jsonp = _interopDefault(require('jsonp-simple'))
var tiloop = _interopDefault(require('tiloop'))

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

var API_URL = function API_URL(account) {
  return 'https://' + identifier(account) + '/api/read/json'
}
var MAX_LIMIT = 50

var postTypes = ['quote', 'text', 'chat', 'photo', 'link', 'video', 'audio']

var jsonpInterface = function jsonpInterface(account, params) {
  var timeout =
    arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 5000

  asserts(typeof account === 'string', 'required account')

  var _ref = params || {},
    start = _ref.start,
    num = _ref.num,
    type = _ref.type,
    tag = _ref.tag,
    id = _ref.id,
    filter = _ref.filter

  return jsonp(
    API_URL(account) +
      joinParams({
        start: start,
        num: num,
        type: type,
        tagged: tag,
        id: id,
        filter: filter
      }),
    timeout
  )
}

var blog = function blog(account, timeout) {
  return jsonpInterface(account, { num: 0 }, timeout).then(function(_ref2) {
    var tumblelog = _ref2.tumblelog
    return tumblelog
  })
}

var posts = function posts() {
  return jsonpInterface.apply(undefined, arguments).then(function(_ref3) {
    var posts = _ref3.posts
    return posts
  })
}

var total = function total(account, params, timeout) {
  var _ref4 = params || {},
    type = _ref4.type,
    tag = _ref4.tag

  return jsonpInterface(
    account,
    { num: 0, type: type, tag: tag },
    timeout
  ).then(function(res) {
    return +res['posts-total']
  })
}

var post = function post(account, id, timeout) {
  asserts(typeof id === 'string' || typeof id === 'number', 'required id')
  return jsonpInterface(account, { id: id }, timeout).then(function(_ref5) {
    var posts = _ref5.posts
    return posts[0]
  })
}

var samplingTags = function samplingTags() {
  return samplingPosts.apply(undefined, arguments).then(postsToTags)
}

var samplingPosts = async function samplingPosts() {
  var _ref6 =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    account = _ref6.account,
    params = _ref6.params,
    denom = _ref6.denom,
    maxLimit = _ref6.maxLimit,
    timeout = _ref6.timeout

  denom = denom || SAMPLING_DENOM
  maxLimit = maxLimit || SAMPLING_MAX_NUM
  asserts(maxLimit <= MAX_LIMIT, 'invalid maxLimit')

  var _ref7 = params || {},
    type = _ref7.type,
    tag = _ref7.tag,
    filter = _ref7.filter

  var length = await total(account, { type: type, tag: tag })
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
        return posts(
          account,
          {
            start: indexedArr[0],
            num: indexedArr.length < maxLimit ? indexedArr.length : maxLimit,
            type: type,
            tag: tag,
            filter: filter
          },
          timeout
        )
      }
    })
  )
}

var generatePosts = async function generatePosts() {
  var _ref8 =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    account = _ref8.account,
    random = _ref8.random,
    params = _ref8.params,
    timeout = _ref8.timeout

  var _ref9 = params || {},
    _ref9$start = _ref9.start,
    start = _ref9$start === undefined ? 0 : _ref9$start,
    _ref9$num = _ref9.num,
    num = _ref9$num === undefined ? 20 : _ref9$num,
    type = _ref9.type,
    tag = _ref9.tag,
    filter = _ref9.filter

  asserts(num <= MAX_LIMIT, 'invalid num')

  var length = await total(account, { type: type, tag: tag })
  asserts(start < length, 'invalid start')

  return tiloop({
    length: length - start,
    maxIncrement: num,
    random: random,
    promisify: true,
    yielded: function yielded(indexedArr) {
      return posts(
        account,
        {
          start: indexedArr[0] + start,
          num: indexedArr.length,
          type: type,
          tag: tag,
          filter: filter
        },
        timeout
      )
    }
  })
}

exports.postTypes = postTypes
exports.blog = blog
exports.posts = posts
exports.total = total
exports.post = post
exports.samplingTags = samplingTags
exports.samplingPosts = samplingPosts
exports.generatePosts = generatePosts
