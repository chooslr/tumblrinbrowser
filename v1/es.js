import regeneratorRuntime from 'regenerator-runtime'
import jsonp from 'jsonp-simple'
import tiloop from 'tiloop'

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

var API_URL = function API_URL(name) {
  return 'https://' + identifier(name) + '/api/read/json'
}
var MAX_LIMIT = 50

var postTypes = ['quote', 'text', 'chat', 'photo', 'link', 'video', 'audio']

var jsonpInterface = function jsonpInterface(name, params) {
  var timeout =
    arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 5000

  asserts(typeof name === 'string', 'required name')

  var _ref = params || {},
    start = _ref.start,
    num = _ref.num,
    type = _ref.type,
    tag = _ref.tag,
    id = _ref.id,
    filter = _ref.filter

  return jsonp(
    API_URL(name) +
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

var blog = function blog(name, timeout) {
  return jsonpInterface(name, { num: 0 }, timeout).then(function(_ref2) {
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

var total = function total(name, params, timeout) {
  var _ref4 = params || {},
    type = _ref4.type,
    tag = _ref4.tag

  return jsonpInterface(name, { num: 0, type: type, tag: tag }, timeout).then(
    function(res) {
      return +res['posts-total']
    }
  )
}

var post = function post(name, id, timeout) {
  asserts(typeof id === 'string' || typeof id === 'number', 'required id')
  return jsonpInterface(name, { id: id }, timeout).then(function(_ref5) {
    var posts = _ref5.posts
    return posts[0]
  })
}

var samplingTags = function samplingTags() {
  return samplingPosts.apply(undefined, arguments).then(postsToTags)
}

var samplingPosts = (function() {
  var _ref6 = asyncToGenerator(
    /*#__PURE__*/ regeneratorRuntime.mark(function _callee() {
      var _ref7 =
          arguments.length > 0 && arguments[0] !== undefined
            ? arguments[0]
            : {},
        name = _ref7.name,
        params = _ref7.params,
        denom = _ref7.denom,
        maxLimit = _ref7.maxLimit,
        timeout = _ref7.timeout

      var _ref8, type, tag, filter, length, maxIncrement

      return regeneratorRuntime.wrap(
        function _callee$(_context) {
          while (1) {
            switch ((_context.prev = _context.next)) {
              case 0:
                denom = denom || SAMPLING_DENOM
                maxLimit = maxLimit || SAMPLING_MAX_NUM
                asserts(maxLimit <= MAX_LIMIT, 'invalid maxLimit')

                ;(_ref8 = params || {}),
                  (type = _ref8.type),
                  (tag = _ref8.tag),
                  (filter = _ref8.filter)
                _context.next = 6
                return total(name, { type: type, tag: tag })

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
                        return posts(
                          name,
                          {
                            start: indexedArr[0],
                            num:
                              indexedArr.length < maxLimit
                                ? indexedArr.length
                                : maxLimit,
                            type: type,
                            tag: tag,
                            filter: filter
                          },
                          timeout
                        )
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

  return function samplingPosts() {
    return _ref6.apply(this, arguments)
  }
})()

var generatePosts = (function() {
  var _ref9 = asyncToGenerator(
    /*#__PURE__*/ regeneratorRuntime.mark(function _callee2() {
      var _ref10 =
          arguments.length > 0 && arguments[0] !== undefined
            ? arguments[0]
            : {},
        name = _ref10.name,
        random = _ref10.random,
        params = _ref10.params,
        timeout = _ref10.timeout

      var _ref11,
        _ref11$start,
        start,
        _ref11$num,
        num,
        type,
        tag,
        filter,
        length

      return regeneratorRuntime.wrap(
        function _callee2$(_context2) {
          while (1) {
            switch ((_context2.prev = _context2.next)) {
              case 0:
                ;(_ref11 = params || {}),
                  (_ref11$start = _ref11.start),
                  (start = _ref11$start === undefined ? 0 : _ref11$start),
                  (_ref11$num = _ref11.num),
                  (num = _ref11$num === undefined ? 20 : _ref11$num),
                  (type = _ref11.type),
                  (tag = _ref11.tag),
                  (filter = _ref11.filter)

                asserts(num <= MAX_LIMIT, 'invalid num')

                _context2.next = 4
                return total(name, { type: type, tag: tag })

              case 4:
                length = _context2.sent

                asserts(start < length, 'invalid start')

                return _context2.abrupt(
                  'return',
                  tiloop({
                    length: length - start,
                    maxIncrement: num,
                    random: random,
                    promisify: true,
                    yielded: function yielded(indexedArr) {
                      return posts(
                        name,
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

  return function generatePosts() {
    return _ref9.apply(this, arguments)
  }
})()

export {
  postTypes,
  blog,
  posts,
  total,
  post,
  samplingTags,
  samplingPosts,
  generatePosts
}
