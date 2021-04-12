/*
 * @Author       : lovefc
 * @Date         : 2021-04-07 18:56:03
 * @LastEditTime : 2021-04-09 09:54:10
 */
const webpack = require('webpack');
const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin'); //  引入html-webpack-plugin插件
const TerserPlugin = require("terser-webpack-plugin"); // 引入 terser-webpack-plugin 插件 (压缩js,css)
// 关于压缩js,css参考文章:https://blog.csdn.net/qq_24147051/article/details/103557728

module.exports = {

    // 定义模式
    mode: 'development',

    entry: {
        'assgin/js/index': './app/src/index.js', //入口文件
        // 可以定义多个入口
        // 键名就是打包后被压缩的js的名称,如果要目录,就用/号分割
    },
    output: {
        path: __dirname + '/dist', // 输出路径
        filename: '[name].[hash:7].js', // 输出文件名
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
                    limit: 100000,
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
            template: 'app/src/page/index.html', //  HTML模板路径
            favicon: 'app/src/page/favicon.ico',
            //showErrors: true,
        }),
		/*
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            jquery: "jquery",
            "window.jQuery": "jquery"
        })
		*/
    ],
    // 静态服务器,参考https://webpack.docschina.org/configuration/dev-server/
	/*
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        port: 9000, // 端口
        open: true, // 自动打开浏览器
        compress: true, // 启动gzip压缩
    },
	*/
    // 压缩js 参考:https://webpack.docschina.org/plugins/terser-webpack-plugin/
    // 附带参考: https://segmentfault.com/a/1190000039389590
    optimization: {
        // 配置可优化
        minimize: true,
        minimizer: [
            new TerserPlugin({
                //  指定压缩的文件
                include: /\.js(\?.*)?$/i,

                // 排除压缩的文件
                // exclude:/\.js(\?.*)?$/i,

                //  是否启用多线程运行，默认为true，开启，默认并发数量为os.cpus()-1
                //  可以设置为false(不使用多线程)或者数值（并发数量）
                parallel: true,

                //  可以设置一个function，使用其它压缩插件覆盖默认的压缩插件，默认为undefined，d，
                minify: undefined,

                //  是否将代码注释提取到一个单独的文件。
                //  属性值：Boolean | String | RegExp | Function<(node, comment) -> Boolean|Object> | Object
                //  默认为true， 只提取/^\**!|@preserve|@license|@cc_on/i注释
                //  感觉没什么特殊情况直接设置为false即可
                extractComments: false,

                //  压缩时的选项设置
                terserOptions: {}
            })
        ]
    }
};