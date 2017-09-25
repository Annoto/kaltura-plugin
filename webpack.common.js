/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
/* eslint func-names: ["error", "never"] */

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const VERSION = require('./package.json').version;

module.exports = function (env) {
    return {
        entry: './app/scripts/main.ts',
        target: 'web',
        output: {
            filename: 'plugin.js',
            path: path.resolve(__dirname, 'dist/'),
            sourceMapFilename: '[name].map',
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    enforce: 'pre',
                    loader: 'tslint-loader',
                    options: {
                        emitErrors: true,
                    },
                },
                {
                    test: /\.ts$/,
                    use: 'ts-loader',
                    exclude: /(node_modules|bower_components)/,
                },
                {
                    test: /\.js$/,
                    enforce: 'pre',

                    loader: 'eslint-loader',
                    options: {
                        emitWarning: true,
                    },
                },
                {
                    test: /\.js$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                        loader: 'babel-loader',
                    },
                },
                {
                    test: /\.hbs$/,
                    loader: 'handlebars-loader',
                },
                {
                    test: /\.scss$/,
                    use: [
                        {
                            loader: 'style-loader',
                        },
                        {
                            loader: 'css-loader',
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                precision: 5,
                                outputStyle: 'compressed',
                            },
                        },
                    ],
                },
            ],
        },
        resolve: {
            extensions: ['.ts', '.js'],
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env': {
                    version: JSON.stringify(VERSION),
                    NODE_ENV: JSON.stringify(env.type),
                },
                APP_URL: JSON.stringify(env.appURL),
            }),
            new HtmlWebpackPlugin({
                template: 'app/index.hbs',
                title: 'Annoto Kaltura Plugin',
                description: 'Annoto Kaltura Plugin',
            }),
            new CopyWebpackPlugin([
                { from: 'app/favicon.ico' },
                { from: 'app/humans.txt' },
                { from: 'app/robots.txt' },
                { from: 'app/manifest.json' },
                { from: 'app/manifest.webapp' },
            ]),
        ],
    };
};
