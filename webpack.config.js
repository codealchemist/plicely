const path = require('path')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  target: 'web',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
    https: true
  }
}
