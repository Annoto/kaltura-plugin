export class Logger {
    static log(...args: any[]) {
        /* eslint no-unused-expressions: ["error", { "allowShortCircuit": true }] */
        window.console && window.console.log('AnnotoKalturaPlugin: ', ...args);
    }
    static warn(...args: any[]) {
        /* eslint no-unused-expressions: ["error", { "allowShortCircuit": true }] */
        window.console && window.console.warn('AnnotoKalturaPlugin: ', ...args);
    }
    static error(...args: any[]) {
        /* eslint no-unused-expressions: ["error", { "allowShortCircuit": true }] */
        window.console && window.console.error('AnnotoKalturaPlugin: ', ...args);
    }
}
