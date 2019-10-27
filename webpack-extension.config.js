const path = require('path');
const webpack = require('webpack');
const { babel } = require('./package.json');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  target: 'web',

  mode: isProd ? 'production' : 'development',

  entry: {
    background: './src/background.js',
    'content-script': './src/content-script.js',
    popup: './src/popup.js'
  },

  output: {
    filename: `[name].js`,
    path: path.resolve(__dirname, 'extension/')
  },

  devtool: isProd ? undefined : 'cheap-module-source-map', // !! eval is not allowed for web extensions

  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: babel.presets,
              plugins: [
                '@babel/plugin-transform-async-to-generator',
                '@babel/plugin-proposal-class-properties'
              ]
            }
          }
        ],
        exclude: isProd ? /node_modules/ : undefined,
        include: [path.resolve(__dirname, 'src')]
      },

      {
        test: /\.css$/,
        sideEffects: true,

        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: false,
              publicPath: path.resolve(__dirname, 'extension/')
            }
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              sourceMap: true
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: function(loader) {
                return [
                  require('postcss-import')(),
                  require('postcss-url')(),
                  require('postcss-preset-env')({
                    browsers: 'last 2 versions',
                    stage: 3
                  })
                ];
              }
            }
          }
        ],
        include: [path.resolve(__dirname, 'src')]
      },

      {
        test: /\.svg$/,
        issuer: {
          test: /\.jsx?$/
        },
        use: ['@svgr/webpack']
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        issuer: {
          test: /\.css$/
        },
        loader: 'url-loader'
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'development'
      )
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    })
  ]
};
