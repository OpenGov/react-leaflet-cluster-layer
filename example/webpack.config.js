/* eslint-disable */
var webpack = require('webpack');

module.exports = {
  devtool: 'source-map',
  entry: {
    app: __dirname + '/index.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          plugins: [
            ['react-transform', {
              transforms: [{
                transform: 'react-transform-hmr',
                imports: ['react'],
                locals: ['module']
              }]
            }]
          ]
        }
      },
    ]
  },
  output: {
    path: __dirname + '/build/',
    filename: '[name].js',
    publicPath: 'http://localhost:8000/build'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': '"development"'
      }
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ],
  devServer: {
    contentBase: __dirname,
    historyApiFallback: true,
    hot: true,
    inline: true,
    port: 8000,
    stats: {
      cached: false
    }
  }
};
