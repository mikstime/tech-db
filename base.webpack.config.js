const path = require('path');
var webpack = require('webpack');
// var nodeModules = {};
// fs.readdirSync(path.resolve(__dirname, 'node_modules'))
//   .filter(x => ['.bin'].indexOf(x) === -1)
//   .forEach(mod => { nodeModules[mod] = `commonjs ${mod}`; });
module.exports = {
  output: {
    path: __dirname + '/public',
    filename: "./bundle.js",
  },
  target: 'node',
  // externals: nodeModules,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          query: {
            presets: ['@babel/preset-env']
          }
        }
      },
    ]
  },
  plugins: [
    new webpack.IgnorePlugin(/^pg-native$/)
  ]
};