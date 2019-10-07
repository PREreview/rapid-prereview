const path = require('path');

module.exports = async ({ config, mode }) => {
  config.module.rules.push({
    test: /\.css$/,
    sideEffects: true,

    use: [
      {
        loader: 'style-loader'
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
    ]
  });
  return config;
};
