// For instructions about this file refer to
// webpack and webpack-hot-middleware documentation
var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  // debug: true,
  devtool: '#eval-source-map',
  // context: path.join(__dirname, 'app', 'js'),

  entry: [
    'react-hot-loader/patch',
    'webpack/hot/dev-server',
    'webpack-hot-middleware/client',
    path.join(__dirname, 'app/index.js')
  ],
  stats: {
    chunks: false,
  },
  output: {
    path: path.join(__dirname, 'app', 'js'),
    publicPath: '/',
    filename: 'bundle.js'
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: 'app/index.tpl.html',
      inject: 'body',
      filename: 'index.html'
    }),
    // new
    // new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ],

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        include: [/app/],
        exclude: /(node_modules|bower_components)/,
        loaders: ['babel-loader']
      },
      {
        test: /\.css$/,
        // loader: 'style-loader!css-loader?modules&localIdentName=[name]---[local]---[hash:base64:5]'
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.json?$/,
        loader: 'json-loader'
      },
      {
        test: /\.scss$/,
        loader: 'style-loader!css-loader?modules&localIdentName=[name]---[local]---[hash:base64:5]!sass-loader'
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "url-loader?limit=10000&mimetype=application/font-woff"
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "file-loader"
      },
      {
            test: /\.less$/,
            use: [{
                loader: "style-loader" // creates style nodes from JS strings
            }, {
                loader: "css-loader" // translates CSS into CommonJS
            }, {
                loader: "less-loader" // compiles Less to CSS
            }]
        }

    ]
  }
};
