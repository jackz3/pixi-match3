const buble = require('rollup-plugin-buble')
const typescript = require('rollup-plugin-typescript')
const nodeResolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')

module.exports = {
  input: 'src/match3.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'iife',
    name: 'app'
  },
  plugins: [
    nodeResolve({
        browser: true,
        preferBuiltins: false,
    }),
    commonjs(),
    typescript(),
    buble(),
    //   terser({
    //     output: {
    //       ascii_only: true
    //     },
    //     compress: {
    //       pure_funcs: ['console.log']
    //     }
    // })
  ]
}