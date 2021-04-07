var webpack = require('webpack');

var path = require('path');
/*
var HtmlWebpackPlugin = require('html-webpack-plugin'); //打包html的插件

module.exports = {

     entry:{
         'app/dist/js/index':'./app/src/js/index.js'  //入口文件

         //我们的是多页面项目，多页面入口配置就是这样，
         //app/src/page下可能还会有很多页面，照着这样配置就行

     },
     output:{
		  path: __dirname + '/dist',    // 输出路径
          //__dirname 当前webpack.config.js的路径
          filename: '[name].js',      //打包后index.js的名字，
                                     // 这个[name]的意思是,配置入口entry键值对里的key值,app/dist/js/index,最后的index，
                                     //这里无论你src/js/index.js这个脚本如何命名，打包后都将是index.js
     },
	 
    module: {
        rules: [  
            {
                test: /\.css$/,   // 正则表达式，表示.css后缀的文件
                use: ['style-loader','css-loader']   // 针对css文件使用的loader，注意有先后顺序，数组项越靠后越先执行
            }
        ]
    },	 
	
	watch: true,   


     //插件
     plugins:[
        new HtmlWebpackPlugin({
            chunks:['app/dist/js/index'],
            filename:'app/index.html',
            template:'app/src/page/index.html'  
        })
     ]
}
*/

const htmlWebpackPlugin = require('html-webpack-plugin'); //  引入html-webpack-plugin插件
module.exports = {
    entry: {
        //jquery:'./app/src/js/jquery.min.js',
        //mdui: './app/src/js/mdui.min.js',
        //fcup: './app/src/js/fcup.min.js',
        'assgin/js/index': './app/src/index.js', //入口文件
        //common: ['./app/src/js/jquery.min.js', './app/src/js/mdui.min.js', './app/src/js/fcup.min.js', './app/src/js/cs.js']
        //我们的是多页面项目，多页面入口配置就是这样，
        //app/src/page下可能还会有很多页面，照着这样配置就行
    },
    output: {
        path: __dirname + '/dist', // 输出路径
        filename: '[name].js', // 输出文件名
    },
    module: {
        rules: [ // 其中包含各种loader的使用规则
            {
                test: /\.(htm|html)$/,
                loader: 'html-withimg-loader'
            },
            {
                test: /\.css$/, // 正则表达式，表示打包.css后缀的文件
                include: __dirname,
                // 排除 node_modules 目录下的文件
                exclude: /(node_modules)/,
                use: ['style-loader', 'css-loader'] // 针对css文件使用的loader，注意有先后顺序，数组项越靠后越先执行
            },
            { // 图片打包
                test: /\.(png|jpg|gif|svg)$/,
                loader: require.resolve('file-loader'),
                options: {
                    name: '[name].[ext]',
                    outputPath: 'assgin/images/',
                    esModule: false
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
    plugins: [ // 打包需要的各种插件
        new htmlWebpackPlugin({ // 打包HTML
            //chunks: ['jquery','mdui','fcup','index'],
            chunks: ['assgin/js/index'],
            inject: true,
            filename: 'index.html', // 输出模板
            template: 'app/src/page/index2.html' //  HTML模板路径
        })
    ]
};