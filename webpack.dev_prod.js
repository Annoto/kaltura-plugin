/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
/* eslint func-names: ["error", "never"] */

const path = require('path');
const Merge = require('webpack-merge');
const CommonConfig = require('./webpack.common');

module.exports = function (env) {
    const commonEnv = env;
    commonEnv.appURL = 'https://app.annoto.net';
    return Merge(CommonConfig(commonEnv), {
        devtool: 'cheap-module-inline-source-map',
        devServer: {
            contentBase: path.join(__dirname, 'dist'),
            port: 9001,
            disableHostCheck: true,
        },
        plugins: [
        ],
    });
};
