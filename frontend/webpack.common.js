const path = require('path');

module.exports = {
  entry: {
    app: './js/app.js',
    auth: './js/auth.js',
    chart: './js/chart-entry.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
    clean: true,
    filename: 'js/[name].js',
  },
};
