const path = require('path');
const webpack = require('webpack');
const AssetsPlugin = require('assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const { babel } = require('./package.json');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  target: 'web',

  mode: isProd ? 'production' : 'development',

  entry: {
    main: isProd
      ? ['./src/client.js']
      : [
          'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000',
          './src/client.js'
        ]
  },

  output: {
    filename: `bundle.[name]${isProd ? '.[chunkhash]' : ''}.js`,
    path: path.resolve(__dirname, 'public/assets/'),
    publicPath: isProd ? undefined : 'http://127.0.0.1:3000/assets/',
    hotUpdateChunkFilename: 'hot/[id].[hash].hot-update.js',
    hotUpdateMainFilename: 'hot/[hash].hot-update.json'
  },

  devtool: isProd ? undefined : 'cheap-module-eval-source-map',

  resolve: {
    mainFields: ['browser', 'main']
  },

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
        exclude: isProd ? /node_modules/ : undefined
      },

      // CSS
      {
        test: /\.css$/,
        sideEffects: true,

        use: [
          {
            loader: isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            options: isProd
              ? { publicPath: path.resolve(__dirname, 'public/assets/') }
              : {}
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
        include: [path.resolve(__dirname, 'src')] // does this work with imports?
      },

      // SVG
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
      'process.env.IS_EXTENSION': false,
      'process.env.API_URL': JSON.stringify(
        process.env.NODE_ENV === 'production'
          ? 'https://oubreaksci.prereview.org'
          : 'http://127.0.0.1:3000'
      )
    }),
    isProd
      ? new MiniCssExtractPlugin({
          filename: 'bundle.[name].[hash].css',
          chunkFilename: 'bundle.[id].[hash].css'
        })
      : null,
    isProd ? null : new webpack.HotModuleReplacementPlugin(),
    new AssetsPlugin({
      filename: 'bundle-manifest.json',
      fullPath: false,
      path: path.resolve(__dirname, 'public/assets/'),
      prettyPrint: true
    }),
    isProd
      ? null
      : new DuplicatePackageCheckerPlugin({
          verbose: true
        })
  ].filter(Boolean)
};
