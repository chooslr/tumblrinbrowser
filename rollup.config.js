import autoexternal from 'rollup-plugin-auto-external'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import prettier from 'rollup-plugin-prettier'
import uglify from 'rollup-plugin-uglify'
import { minify } from 'uglify-es'

const v2 = 'src/v2.js'
const v1 = 'src/v1.js'
const exports = 'named'
const name = 'tumblr'

const esPlugins = [
  babel({ exclude: 'node_modules/**' }),
  autoexternal({ builtins: true, dependencies: true }),
  prettier({ tabWidth: 2, semi: false, singleQuote: true })
]

const umdPlugins = [
  babel({ exclude: 'node_modules/**' }),
  resolve(),
  commonjs(),
  uglify({}, minify)
]

export default [
  {
    input: v2,
    plugins: esPlugins,
    output: [
      { format: 'cjs', file: 'v2/cjs.js', exports },
      { format: 'es', file: 'v2/es.js', exports },
    ],
  },
  {
    input: v2,
    plugins: umdPlugins,
    output: { format: 'umd', file: 'v2/min.js', exports, name: name + 'V2' }
  },
  {
    input: v1,
    plugins: esPlugins,
    output: [
      { format: 'cjs', file: 'v1/cjs.js', exports },
      { format: 'es', file: 'v1/es.js', exports },
    ],
  },
  {
    input: v1,
    plugins: umdPlugins,
    output: { format: 'umd', file: 'v1/min.js', exports, name: name + 'V1' }
  }
]