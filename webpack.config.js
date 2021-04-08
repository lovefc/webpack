/*
 * @Author       : lovefc
 * @Date         : 2021-04-07 18:56:03
 * @LastEditTime : 2021-04-08 14:50:46
 */
const webpack = require('webpack');
const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin'); //  引入html-webpack-plugin插件

module.exports = {
    entry: {
        'assgin/js/index': './app/src/index.js', //入口文件
    },
    output: {
        path: __dirname + '/dist', // 输出路径
        filename: '[name].js', // 输出文件名
    },
    module: {
        // 其中包含各种loader的使用规则
        rules: [{
                // 命中html后缀文件,使用html-withimg-loader去处理
                test: /\.(htm|html)$/,
                loader: 'html-withimg-loader'
            },
            {
                // 正则表达式，表示打包.css后缀的文件
                test: /\.css$/,
                // 只命中指定 目录下的文件，加快Webpack 搜索速度
                include: __dirname,
                // 排除 node_modules 目录下的文件
                exclude: /(node_modules)/,
                use: ['style-loader', 'css-loader'] // 针对css文件使用的loader，注意有先后顺序，数组项越靠后越先执行
            },
            { // 图片处理
                test: /\.(png|jpg|gif|svg)$/,
                loader: require.resolve('file-loader'),
                options: {
                    name: '[name].[ext]',
                    outputPath: 'assgin/images/', // 输出目录
                    esModule: false
                }
            },
            { // js兼容处理
                test: /\.js$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env'], // 声明兼容模式
                }
            },
            {
                // 命中字体包
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                // 只命中指定 目录下的文件，加快Webpack 搜索速度
                include: __dirname,
                // 排除 node_modules 目录下的文件
                exclude: /(node_modules)/,
                loader: 'file-loader',
                // 新增options配置参数：关于file-loader的配置项
                options: {
                    limit: 10000,
                    // 定义打包完成后最终导出的文件路径
                    outputPath: 'assgin/css/fonts/',
                    // 文件的最终名称
                    name: '[name].[hash:7].[ext]'
                }
            }
        ]
    },
    // 打包插件
    plugins: [
        new htmlWebpackPlugin({ // 打包HTML
            chunks: ['assgin/js/index'],
            inject: 'body', // 这里是指定js注入的位置,body为在body的后面
            filename: 'index.html', // 输出模板
            template: 'app/src/page/index2.html', //  HTML模板路径
            favicon: 'app/src/page/favicon.ico',
            //showErrors: true,
        }),
        new webpack.ProvidePlugin({
           $: "jquery",
           jQuery: "jquery",
           jquery: "jquery",
           "window.jQuery": "jquery"
        })		
    ],
    // 静态服务器,参考https://webpack.docschina.org/configuration/dev-server/
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        port: 9000, // 端口
        open: true, // 自动打开浏览器
        compress: true, // 启动gzip压缩
    },
};