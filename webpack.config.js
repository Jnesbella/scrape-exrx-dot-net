const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const srcDir = path.join(__dirname, 'app');
const outputDir = path.join(__dirname, 'dist');

module.exports = {
    entry: path.join(srcDir, 'index.js'),
    output: {
        path: outputDir,
        filename: 'bundle.js',
    },
    devtool: 'cheap-module-eval-source-map ',
    plugins: [
        new HtmlWebpackPlugin({
            title: 'FITNESS APP (working title)',
            filename: 'index.html',
            template: path.join(srcDir, 'index.html'),
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('development'),
            },
        }),
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {},
                },
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: 'style-loader', // creates style nodes from JS strings
                    },
                    {
                        loader: 'css-loader', // translates CSS into CommonJS
                    },
                    {
                        loader: 'sass-loader', // compiles Sass to CSS
                    },
                ],
            },
        ],
    },
    devServer: {
        contentBase: outputDir,
        port: 9000,
        hot: true,
        index: 'index.html',
        inline: true,
        open: true,
        proxy: {
            '/api': 'http://localhost:3000',
        },
        publicPath: '/',
        watchContentBase: true,
    },
};
