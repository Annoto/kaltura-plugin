const { merge } = require('webpack-merge');
const CommonConfig = require('./webpack.common');

module.exports = function (env) {
    const commonEnv = env;
    commonEnv.appURL = `${env.https ? 'https' : 'http'}://localhost:9000`;
    return merge(CommonConfig(commonEnv), {
        devtool: 'inline-cheap-module-source-map',
        mode: 'development',
        devServer: {
            port: 9001,
            allowedHosts: 'all',
        },
    });
};
