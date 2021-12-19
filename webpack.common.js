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
                /* {
                    test: /\.ts$/,
                    enforce: 'pre',
                    loader: 'tslint-loader',
                    options: {
                        emitErrors: true,
                    },
                }, */
                {
                    test: /\.ts$/,
                    loader: 'ts-loader',
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
                            loader: 'postcss-loader',
                            options: {
                                postcssOptions: {
                                    plugins: [
                                        [
                                            'autoprefixer',
                                            {
                                                // Options
                                            },
                                        ],
                                    ]
                                }
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sassOptions: {
                                    precision: 5,
                                    outputStyle: 'compressed',
                                }
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
                    ENV: JSON.stringify(env.envName),
                },
                APP_URL: JSON.stringify(env.appURL),
            }),
            new HtmlWebpackPlugin({
                template: 'app/index.ejs',
                title: 'Annoto Kaltura Plugin',
                description: 'Annoto Kaltura Plugin',
            }),
            new CopyWebpackPlugin({
                patterns: [
                    { from: 'app/favicon.ico' },
                    { from: 'app/humans.txt' },
                    { from: 'app/robots.txt' },
                    { from: 'app/manifest.json' },
                    { from: 'app/manifest.webapp' },
                ]
            }),
        ],
    };
};
