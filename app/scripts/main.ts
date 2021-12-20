import { init } from './plugin';
import constantsJs from './constants';

declare const mw: {
    kalturaPluginWrapper: any,
};

const BOOTSRAP = `${constantsJs.APP_URL}/bootstrap.js`;

if (mw && mw.kalturaPluginWrapper) {
    init({
        bootUrl: BOOTSRAP,
    });
}
