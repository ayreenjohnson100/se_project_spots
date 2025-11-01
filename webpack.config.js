const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: {
    main: "./src/pages/index.js", // <- your main JS file
  },

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",
    publicPath: "",
    assetModuleFilename: "assets/[hash][ext][query]", // where images/fonts go in dist
  },

  mode: "development",
  devtool: "inline-source-map",
  stats: "errors-only",

  devServer: {
    static: path.resolve(__dirname, "./dist"),
    compress: true,
    port: 8080,
    open: true,
    liveReload: true,
    hot: false,
  },

  target: ["web", "es5"],

  module: {
    rules: [
      // 1. JS -> Babel
      {
        test: /\.js$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },

      // 2. CSS -> extract to its own file, run postcss
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              importLoaders: 1, // so @import works with postcss
            },
          },
          "postcss-loader",
        ],
      },

      // 3. Images & fonts (png, svg, jpg, gif, woff, etc.)
      {
        test: /\.(png|svg|jpg|jpeg|webp|gif|woff2?|eot|ttf|otf)$/i,
        type: "asset/resource",
      },

      // 4. HTML loader so `<%= require('../images/...') %>` works in index.html
      {
        test: /\.html$/i,
        loader: "html-loader",
        options: {
          sources: {
            list: [
              "...", // keep default tags it already handles (img[src], source[srcset], etc.)
              {
                tag: "img",
                attribute: "src",
                type: "src",
              },
            ],
          },
        },
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html", // <- use your src/index.html
      favicon: "./src/images/favicon.ico", // make sure this file exists
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "main.css",
    }),
  ],
};
