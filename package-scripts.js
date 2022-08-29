const { series, rimraf } = require('nps-utils');
const pkg = require('./package.json');

const S3_REGION = 'eu-central-1';


function s3deploy({ bcuketName, distId, region, cache, latestVersion, isProduction }) {
    const name = pkg.name.replace(/^\@annoto\//, '');
    const version = latestVersion ? 'latest' : pkg.version;
    const prefix = `${isProduction ? '' : 'staging/'}${name}/${version}`;
    let command = `s3-deploy './dist/**' --cwd './dist/' --region '${region}' --bucket '${bcuketName}'`;
    command += ` --filePrefix '${prefix}'`;
    if (distId) {
        command += ` --distId '${distId}' --invalidate '/${prefix}*'`;
    }
    command += ` --gzip 'js' --cache '86400, no-transform, ${cache ? 'public' : 'no-cache'}'`;

    return command;
}

module.exports = {
    options: {
        'help-style': 'basic',
    },
    scripts: {
        default: 'nps webpack',
        build: {
            default: 'nps build.prod',
            prod: {
                script: series(
                    rimraf('dist'),
                    'webpack --env envName=prod --progress'
                ),
            },
            staging: {
                script: series(
                    rimraf('dist'),
                    'webpack --env envName=staging --progress',
                ),
            },
            dev: {
                script: series(
                    rimraf('dist'),
                    'webpack --env envName=dev --progress',
                ),
            }
        },
        dev: {
            default: {
                script: 'webpack serve --env envName=dev'
            },
            proxy: {
                script: 'webpack serve --env envName=dev_proxy'
            },
            https: {
                script: 'webpack serve --env envName=dev --env https=1 --https'
            },
            staging: {
                script: 'webpack serve --env envName=dev_staging --env https=1 --https'
            },
            prod: {
                script: 'webpack serve --env envName=prod --env https=1 --https'
            },
        },
        deploy: {
            default: series(
                'nps build.staging',
                'export AWS_ACCESS_KEY_ID=$AWS_S3_ACCESS_ID;export AWS_SECRET_ACCESS_KEY=$AWS_S3_SECRET',
                s3deploy({
                    bcuketName: 'cdn.annoto.net',
                    distId: 'E2PYBK8LLNZMVK',
                    region: S3_REGION,
                    cache: false,
                    latestVersion: false,
                    isProduction: false,
                }),
                s3deploy({
                    bcuketName: 'cdn.annoto.net',
                    distId: 'E2PYBK8LLNZMVK',
                    region: S3_REGION,
                    cache: false,
                    latestVersion: true,
                    isProduction: false,
                }),
            ),
            prod: series(
                'nps build.prod',
                'export AWS_ACCESS_KEY_ID=$AWS_S3_ACCESS_ID;export AWS_SECRET_ACCESS_KEY=$AWS_S3_SECRET',
                s3deploy({
                    bcuketName: 'cdn.annoto.net',
                    distId: 'E2PYBK8LLNZMVK',
                    region: S3_REGION,
                    cache: true,
                    latestVersion: false,
                    isProduction: true,
                }),
                s3deploy({
                    bcuketName: 'cdn.annoto.net',
                    distId: 'E2PYBK8LLNZMVK',
                    region: S3_REGION,
                    cache: true,
                    latestVersion: true,
                    isProduction: true,
                }),
            ),
        },
    },
}
