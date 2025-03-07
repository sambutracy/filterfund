const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader'
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ['file-loader']
      }
    ]
  },
  plugins: [
    // Load environment variables
    new Dotenv({
      systemvars: true, // Load all system environment variables as well
    }),
    // Define additional environment variables
    new webpack.DefinePlugin({
      'process.env.REACT_APP_ASSET_CANISTER_ID': JSON.stringify(process.env.REACT_APP_ASSET_CANISTER_ID || 'bkyz2-fmaaa-aaaaa-qaaaq-cai'),
      'process.env.REACT_APP_CAMPAIGN_CANISTER_ID': JSON.stringify(process.env.REACT_APP_CAMPAIGN_CANISTER_ID || 'be2us-64aaa-aaaaa-qaabq-cai'),
      'process.env.REACT_APP_USER_CANISTER_ID': JSON.stringify(process.env.REACT_APP_USER_CANISTER_ID || 'br5f7-7uaaa-aaaaa-qaaca-cai'),
      'process.env.REACT_APP_IC_HOST': JSON.stringify(process.env.REACT_APP_IC_HOST || 'http://localhost:8000'),
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      favicon: './public/favicon.ico'
    })
  ],
  devServer: {
    historyApiFallback: true,
    port: 3000,
    open: true,
    // Proxy for connecting to the local Internet Computer
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
};
