/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

const gulp = require('gulp');
const awspublish = require('gulp-awspublish');
const s3options = require('./s3-options');
const argv = require('yargs').argv;

gulp.task('publish', () => {
    // create a new publisher using S3 options
    // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property
    // http://docs.aws.amazon.com/AmazonS3/latest/API/RESTObjectPUT.html
    // http://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#canned-acl
    // http://docs.aws.amazon.com/AmazonS3/latest/API/RESTCommonRequestHeaders.html
    // http://docs.aws.amazon.com/general/latest/gr/rande.html#s3_region

    const bucketName = argv.prod ? 'kaltura.annoto.net' : 'kaltura.staging.annoto.net';
    const cacheFile = argv.prod ? '.aws-publish' : '.aws-staging-publish';

    const options = s3options;
    options.params = {
        Bucket: bucketName,
    };
    const publisher = awspublish.create(options, {
        cacheFileName: `tasks/${cacheFile}`,
    });

    // define custom headers
    const headers = {
        'Cache-Control': 'max-age=86400, no-transform, public',  // cache for 1 day, no change of data, don't let others cache (proxies)
    };

    return gulp.src(['dist/**/*.*'])

    // gzip, Set Content-Encoding headers and add .gz extension
        .pipe(awspublish.gzip())

        // publisher will add Content-Length, Content-Type and headers specified above
        // If not specified it will set x-amz-acl to public-read by default
        .pipe(publisher.publish(headers /* , {noAcl: true} */))

        .pipe(publisher.sync())

        // create a cache file to speed up consecutive uploads
        .pipe(publisher.cache())


        // print upload updates to console
        .pipe(awspublish.reporter());
});
