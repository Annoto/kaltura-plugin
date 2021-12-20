/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
/* eslint func-names: ["error", "never"] */

const path = require('path');
const { merge } = require('webpack-merge');
const CommonConfig = require('./webpack.common');

module.exports = function (env) {
    const commonEnv = env;
    commonEnv.appURL = `https://cdn.annoto.net/staging/widget/latest`;
    return merge(CommonConfig(commonEnv), {
        devtool: 'inline-cheap-module-source-map',
        mode: 'development',
        devServer: {
            contentBase: path.join(__dirname, 'dist'),
            port: 9001,
        },
    });
};
