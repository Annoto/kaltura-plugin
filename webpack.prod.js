/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
/* eslint func-names: ["error", "never"] */

const Merge = require('webpack-merge');
const CommonConfig = require('./webpack.common');
const webpack = require('webpack');

module.exports = function (env) {
    const commonEnv = env;
    commonEnv.appURL = 'https://app.annoto.net';
    return Merge(CommonConfig(env), {
        devtool: 'nosources-source-map',
        plugins: [
            new webpack.LoaderOptionsPlugin({
                minimize: true,
                debug: false,
            }),
            new webpack.optimize.UglifyJsPlugin({
                beautify: false,
                mangle: {
                    screw_ie8: true,
                    keep_fnames: true,
                },
                compress: {
                    screw_ie8: true,
                },
                comments: false,
            }),
        ],
    });
};
