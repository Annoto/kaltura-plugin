## Overview

Annoto Kaltura Plugin

## Quickstart

### Install dependencies
```bash
npm install
npm i -g gulp
```

### Run development
```bash
npm run start
```

### Build for production
```bash
npm run build
```

### Build for staging
```bash
npm run build:staging
```

### Upload assets to AWS S3
Make sure to set environmental variables:
```bash
AWS_S3_ACCESS_ID
AWS_S3_SECRET
```
To upload run:
```bash
gulp publish
gulp publish --prod
```

### test loading speed
```bash
gulp pagespeed

```

## Accessing Annoto widget API

```javascript
    kWidget.addReadyCallback( function(playerId){
        var kdp = document.getElementById(playerId); 

        kdp.kBind( 'annotoPluginReady', function(api) { 
            console.log('Annoto is ready and the API can now be used'); 
        
            kdp.kUnbind('annotoPluginReady');
        });
    });
```


## Babel Notes

`.babelrc` contains the transpiler configuration.

It uses the [babel-preset-env](https://www.npmjs.com/package/babel-preset-env).

To find out the list of browsers for the browserlist configuration check out [browserl.ist](http://browserl.ist/?q=last+2+Chrome+versions%2C+last+2+Firefox+versions%2Clast+2+Android+versions%2Clast+2+iOS+versions%2Clast+2+Safari+versions%2Clast+2+Samsung+versions%2Clast+2+ChromeAndroid+versions%2Clast+2+Edge+versions%2Clast+2+FirefoxAndroid+versions%2Clast+1+Opera+versions%2CExplorer+>%3D+11)

As an alternative configuration (instead of using the env preset):
```json

{
  "presets": [
      [
          "es2015",
          {
              "modules": false,
              "loose": true
          }
      ],
      "stage-1"
  ],
    "plugins": [
        "syntax-flow",
        "transform-flow-strip-types",
        "transform-class-properties"
    ],
  "retainLines": true
}
```

## ESLint Notes

[Airbnb](https://github.com/airbnb) does not allow `for of` loops: [Issue](https://github.com/airbnb/javascript/issues/1271).

[Airbnb](https://github.com/airbnb) does not allow underscore variables `no-underscore-dangle` but override it in .eslintc to use convention of internal class methods. Nothing to do with privacy.
