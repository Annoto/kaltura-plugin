/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

const gulp = require('gulp');
const psi = require('psi');
const argv = require('yargs').argv;

// Run PageSpeed Insights
gulp.task('pagespeed', () => {
    const url = argv.prod ? 'https://kaltura.annoto.net' : 'https://kaltura.staging.annoto.net';
    return psi.output(url, {
        strategy: 'mobile',
        // Use a Google Developer API key if you have one: http://goo.gl/RkN0vE
        // key: 'YOUR_API_KEY'
    });
});
