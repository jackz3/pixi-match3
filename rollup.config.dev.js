process.env.NODE_ENV = 'development'

const serve = require('rollup-plugin-serve')
const config = require('./rollup.config')

const PORT = 3000;
// const devSite = `http://127.0.0.1:${PORT}`;
// const devPath = path.join('example', 'index.html');
// const devUrl = `${devSite}/${devPath}`;

config.output.sourcemap = true
config.plugins = [
  ...config.plugins,
  serve({
    port: PORT,
    contentBase: [`${__dirname}`]
  })
]

module.exports = config