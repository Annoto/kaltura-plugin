import { init } from './plugin';
import constantsJs from './constants.js';

declare const mw: {
    kalturaPluginWrapper: any,
};

const BOOTSRAP = `${constantsJs.APP_URL}/annoto-bootstrap.js`;

if (mw && mw.kalturaPluginWrapper) {
    init({
        bootUrl: BOOTSRAP,
    });
}
