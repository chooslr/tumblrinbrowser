'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

function _interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex
}

var regeneratorRuntime = _interopDefault(require('regenerator-runtime'))
var tiloop = _interopDefault(require('tiloop'))

var asyncToGenerator = function(fn) {
  return function() {
    var gen = fn.apply(this, arguments)
    return new Promise(function(resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg)
          var value = info.value
        } catch (error) {
          reject(error)
          return
        }

        if (info.done) {
          resolve(value)
        } else {
          return Promise.resolve(value).then(
            function(value) {
              step('next', value)
            },
            function(err) {
              step('throw', err)
            }
          )
        }
      }

      return step('next')
    })
  }
}

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

var identifier = function identifier(name) {
  return name + '.tumblr.com'
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

var _this = undefined

var ORIGIN = 'https://api.tumblr.com'
var API_URL = function API_URL(name, proxy) {
  return (proxy ? pathformat(proxy) : ORIGIN) + '/v2/blog/' + identifier(name)
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

var avatar = function avatar(name) {
  var size =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 64
  return API_URL(name) + '/avatar/' + size
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

var nameAssert = function nameAssert(name) {
  return asserts(typeof name === 'string', 'required name')
}

var postsInterface = function postsInterface() {
  var _ref2 =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    api_key = _ref2.api_key,
    proxy = _ref2.proxy,
    name = _ref2.name,
    params = _ref2.params

  requireAssert(api_key, proxy)
  nameAssert(name)

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
    API_URL(name, proxy) +
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
    name = _ref4.name

  requireAssert(api_key, proxy)
  nameAssert(name)

  return fetchInterface(
    API_URL(name, proxy) + '/info' + joinParams({ api_key: api_key }),
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
    name = _ref7.name,
    params = _ref7.params

  var _ref8 = params || {},
    type = _ref8.type,
    tag = _ref8.tag

  return postsInterface({
    api_key: api_key,
    proxy: proxy,
    name: name,
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
    name = _ref10.name,
    id = _ref10.id,
    params = _ref10.params

  asserts(typeof id === 'string' || typeof id === 'number', 'required id')

  var _ref11 = params || {},
    reblog_info = _ref11.reblog_info,
    notes_info = _ref11.notes_info

  return postsInterface({
    api_key: api_key,
    proxy: proxy,
    name: name,
    params: { id: id, reblog_info: reblog_info, notes_info: notes_info }
  }).then(function(_ref12) {
    var posts = _ref12.posts
    return posts[0]
  })
}
var _samplingTags = function _samplingTags(options) {
  return _samplingPosts(options).then(postsToTags)
}
var _samplingPosts = (function() {
  var _ref13 = asyncToGenerator(
    /*#__PURE__*/ regeneratorRuntime.mark(function _callee() {
      var _ref14 =
          arguments.length > 0 && arguments[0] !== undefined
            ? arguments[0]
            : {},
        api_key = _ref14.api_key,
        proxy = _ref14.proxy,
        name = _ref14.name,
        params = _ref14.params,
        denom = _ref14.denom,
        maxLimit = _ref14.maxLimit

      var _ref15,
        type,
        tag,
        reblog_info,
        notes_info,
        filter,
        length,
        maxIncrement

      return regeneratorRuntime.wrap(
        function _callee$(_context) {
          while (1) {
            switch ((_context.prev = _context.next)) {
              case 0:
                denom = denom || SAMPLING_DENOM
                maxLimit = maxLimit || SAMPLING_MAX_NUM
                asserts(maxLimit <= MAX_LIMIT, 'invalid maxLimit')

                ;(_ref15 = params || {}),
                  (type = _ref15.type),
                  (tag = _ref15.tag),
                  (reblog_info = _ref15.reblog_info),
                  (notes_info = _ref15.notes_info),
                  (filter = _ref15.filter)
                _context.next = 6
                return _total({
                  api_key: api_key,
                  proxy: proxy,
                  name: name,
                  params: { type: type, tag: tag }
                })

              case 6:
                length = _context.sent

                asserts(length > 0, 'sampling name has no posts')

                maxIncrement = Math.floor(length / denom)

                asserts(maxIncrement > 0, 'invalid denom')

                return _context.abrupt(
                  'return',
                  recursiveAddPostTillDone(
                    tiloop({
                      length: length,
                      maxIncrement: maxIncrement,
                      random: true,
                      promisify: true,
                      yielded: function yielded(indexedArr) {
                        return _posts({
                          api_key: api_key,
                          proxy: proxy,
                          name: name,
                          params: {
                            offset: indexedArr[0],
                            limit:
                              indexedArr.length < maxLimit
                                ? indexedArr.length
                                : maxLimit,
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
                )

              case 11:
              case 'end':
                return _context.stop()
            }
          }
        },
        _callee,
        _this
      )
    })
  )

  return function _samplingPosts() {
    return _ref13.apply(this, arguments)
  }
})()
var _generatePosts = (function() {
  var _ref16 = asyncToGenerator(
    /*#__PURE__*/ regeneratorRuntime.mark(function _callee2() {
      var _ref17 =
          arguments.length > 0 && arguments[0] !== undefined
            ? arguments[0]
            : {},
        api_key = _ref17.api_key,
        proxy = _ref17.proxy,
        name = _ref17.name,
        random = _ref17.random,
        params = _ref17.params

      var _ref18,
        _ref18$offset,
        offset,
        _ref18$limit,
        limit,
        type,
        tag,
        reblog_info,
        notes_info,
        filter,
        length

      return regeneratorRuntime.wrap(
        function _callee2$(_context2) {
          while (1) {
            switch ((_context2.prev = _context2.next)) {
              case 0:
                ;(_ref18 = params || {}),
                  (_ref18$offset = _ref18.offset),
                  (offset = _ref18$offset === undefined ? 0 : _ref18$offset),
                  (_ref18$limit = _ref18.limit),
                  (limit =
                    _ref18$limit === undefined ? MAX_LIMIT : _ref18$limit),
                  (type = _ref18.type),
                  (tag = _ref18.tag),
                  (reblog_info = _ref18.reblog_info),
                  (notes_info = _ref18.notes_info),
                  (filter = _ref18.filter)

                asserts(limit <= MAX_LIMIT, 'Posts > invalid limit')

                _context2.next = 4
                return _total({
                  api_key: api_key,
                  proxy: proxy,
                  name: name,
                  params: { type: type, tag: tag }
                })

              case 4:
                length = _context2.sent

                asserts(offset < length, 'Posts > invalid offset')

                return _context2.abrupt(
                  'return',
                  tiloop({
                    length: length - offset,
                    maxIncrement: limit,
                    random: random,
                    promisify: true,
                    yielded: function yielded(indexedArr) {
                      return _posts({
                        api_key: api_key,
                        proxy: proxy,
                        name: name,
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
                )

              case 7:
              case 'end':
                return _context2.stop()
            }
          }
        },
        _callee2,
        _this
      )
    })
  )

  return function _generatePosts() {
    return _ref16.apply(this, arguments)
  }
})()
var Tumblr = (function() {
  function Tumblr() {
    var _ref19 =
        arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      api_key = _ref19.api_key,
      proxy = _ref19.proxy

    classCallCheck(this, Tumblr)

    requireAssert(api_key, proxy)
    this.api_key = api_key
    this.proxy = proxy
  }

  createClass(Tumblr, [
    {
      key: 'blog',
      value: function blog(name) {
        return _blog({ api_key: this.api_key, proxy: this.proxy, name: name })
      }
    },
    {
      key: 'posts',
      value: function posts(name, params) {
        return _posts({
          api_key: this.api_key,
          proxy: this.proxy,
          name: name,
          params: params
        })
      }
    },
    {
      key: 'total',
      value: function total(name, params) {
        return _total({
          api_key: this.api_key,
          proxy: this.proxy,
          name: name,
          params: params
        })
      }
    },
    {
      key: 'post',
      value: function post(name, id, params) {
        return _post({
          api_key: this.api_key,
          proxy: this.proxy,
          name: name,
          id: id,
          params: params
        })
      }
    },
    {
      key: 'samplingPosts',
      value: function samplingPosts() {
        var _ref20 =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : {},
          name = _ref20.name,
          params = _ref20.params,
          denom = _ref20.denom,
          maxLimit = _ref20.maxLimit

        return _samplingPosts({
          api_key: this.api_key,
          proxy: this.proxy,
          name: name,
          params: params,
          denom: denom,
          maxLimit: maxLimit
        })
      }
    },
    {
      key: 'samplingTags',
      value: function samplingTags() {
        var _ref21 =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : {},
          name = _ref21.name,
          params = _ref21.params,
          denom = _ref21.denom,
          maxLimit = _ref21.maxLimit,
          proxy = _ref21.proxy

        return _samplingTags({
          api_key: this.api_key,
          proxy: this.proxy,
          name: name,
          params: params,
          denom: denom,
          maxLimit: maxLimit
        })
      }
    },
    {
      key: 'generatePosts',
      value: function generatePosts() {
        var _ref22 =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : {},
          name = _ref22.name,
          params = _ref22.params,
          random = _ref22.random

        return _generatePosts({
          api_key: this.api_key,
          proxy: this.proxy,
          name: name,
          params: params,
          random: random
        })
      }
    }
  ])
  return Tumblr
})()

exports.postTypes = postTypes
exports.avatarSizes = avatarSizes
exports.avatar = avatar
exports.blog = _blog
exports.posts = _posts
exports.total = _total
exports.post = _post
exports.samplingTags = _samplingTags
exports.samplingPosts = _samplingPosts
exports.generatePosts = _generatePosts
exports.Tumblr = Tumblr
exports.default = Tumblr
