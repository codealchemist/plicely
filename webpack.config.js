const path = require('path')
const OfflinePlugin = require('offline-plugin')
const VersionFile = require('webpack-version-file-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin

const versionTemplate = `{
  "version": "<%= package.version %>",
  "name": "<%= package.name %>",
  "date": "<%= currentTime %>"
}`

module.exports = {
  entry: './src/client/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  target: 'web',
  node: {
    fs: 'empty'
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
    https: true
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ['file-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/client/index.html',
      hash: true
    }),
    new BundleAnalyzerPlugin({ openAnalyzer: false }),
    new VersionFile({
      packageFile: path.join(__dirname, 'package.json'),
      templateString: versionTemplate,
      outputFile: path.join('dist', 'version.json')
    }),
    new OfflinePlugin({
      externals: ['/', 'site.webmanifest'],
      ServiceWorker: {
        entry: './sw-external.js'
      }
    })
  ]
}
