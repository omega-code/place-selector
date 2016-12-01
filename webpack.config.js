webpack = require('webpack');
module.exports = {
      entry: './src/ts/app.ts',
      output: {
          filename: './dist/bundle.js'
      },
      resolve: {
          extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
      },
      module: {
          loaders: [
              { test: /\.ts$/, loader: 'ts-loader' },
              { test: /\.css$/, loader: 'style!css' }
          ]
      },
      plugins: [
          new webpack.optimize.UglifyJsPlugin({
              compress: {
                  warnings: false
              }
          })
      ]
}
