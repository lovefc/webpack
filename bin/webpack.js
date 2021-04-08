/*
 * @Author       : lovefc
 * @Date         : 2021-04-08 16:52:19
 * @LastEditTime : 2021-04-08 17:10:31
 */
 
// 通过js启动webpack, 详见:https://blog.csdn.net/qq_41257129/article/details/104038713
// 通过js启动webpack-server 详见: https://segmentfault.com/q/1010000005767033

const WebpackDevServer = require("webpack-dev-server");
const webpack = require('webpack');
const path = require('path');

// 读取webpack.config.js文件中的配置
const config = require('../webpack.config.js');

var compiler = webpack(config);

// 调用compiler.watch并以监听模式启动，返回的watching用来关闭监听
const watching = compiler.watch({
    aggregateTimeout: 300,
}, (err, stats) => {
    // 每次因文件发生变化而重新执行完构建之后
});


var server = new WebpackDevServer(compiler, {
  // webpack-dev-server options

  contentBase: path.join(path.resolve(__dirname, '..'), 'dist'),
  // or: contentBase: "http://localhost/",

  // 热更新
  hot: true,
  // Enable special support for Hot Module Replacement
  // Page is no longer updated, but a "webpackHotUpdate" message is send to the content
  // Use "webpack/hot/dev-server" as additional module in your entry point
  // Note: this does _not_ add the `HotModuleReplacementPlugin` like the CLI option does. 

  // Set this as true if you want to access dev server from arbitrary url.
  // This is handy if you are using a html5 router.
  historyApiFallback: false,

  // 启用gzip压缩
  compress: true,

  // Set this if you want webpack-dev-server to delegate a single path to an arbitrary server.
  // Use "*" to proxy all paths to the specified server.
  // This is useful if you want to get rid of 'http://localhost:8080/' in script[src],
  // and has many other use cases (see https://github.com/webpack/webpack-dev-server/pull/127 ).
  /*
  proxy: {
    "*": "http://localhost:9090"
  },
  */

  // pass [static options](http://expressjs.com/en/4x/api.html#express.static) to inner express server
  staticOptions: {},

  open: true, // 立刻跳转到浏览器
  // webpack-dev-middleware options
  quiet: false,
  noInfo: false,
  lazy: true,
  filename: "bundle.js",
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  },
  publicPath: "/assets/",
  headers: {
    "X-Custom-Header": "yes"
  },
  stats: {
    colors: true
  }
});
server.listen(9000, "localhost", function () {
  console.log('Server listening on http://localhost:9000/ ...');
});