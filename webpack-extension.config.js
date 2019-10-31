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
                  require('postcss-url')({
                    filter: asset => {
                      return /^.*\.(svg|png|css|jpeg)$/.test(
                        asset.relativePath
                      );
                    }
                  }),
                  require('postcss-preset-env')({
                    /* see: https://github.com/csstools/postcss-preset-env/issues/32 */
                    browsers: 'last 2 versions',
                    stage: 3,
                    features: {
                      'nesting-rules': false /* disable css nesting which does not allow nesting of selectors without white spaces between them */,
                      'custom-media-queries': true
                    }
                  }),
                  require('postcss-nested') /*replace cssnext nesting with this one which allows for sass style nesting*/
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
      ),
      'process.env.IS_EXTENSION': true,
      'process.env.COOKIE_URL': JSON.stringify(
        process.env.NODE_ENV === 'production'
          ? 'https://oubreaksci.prereview.org'
          : 'http://127.0.0.1'
      ),
      'process.env.API_URL': JSON.stringify(
        process.env.NODE_ENV === 'production'
          ? 'https://oubreaksci.prereview.org'
          : 'http://127.0.0.1:3000'
      )
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    })
  ]
};
