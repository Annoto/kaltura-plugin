module.exports = {
    extends: "airbnb-base",
    parser: "babel-eslint",
    env: {
        browser: true,
        es6: true
    },
    ecmaFeatures: {
        "arrowFunctions": true,
        "blockBindings": true,
        "classes": true,
        "defaultParams": true,
        "destructuring": true,
        "forOf": true,
        "generators": false,
        "modules": true,
        "spread": true,
        "superInFunctions": true,
        "templateStrings": true,
        "jsx": false
    },
    rules: {
        indent: ["error", 4],
        'no-underscore-dangle': ['error', { allowAfterThis: true }]
    }
};
