import { DeviceDetectorApi } from '@annoto/widget-api';

declare const mw: {
    isMobileDevice: () => boolean,
    isIpod: () => boolean;
    isIpad: () => boolean;
};

export class DeviceDetector implements DeviceDetectorApi {
    public isSmallScreen() : boolean {
        return mw.isMobileDevice();
    }

    public isPhone() : boolean {
        return mw.isMobileDevice();
    }

    public isTablet() : boolean {
        return false;
    }

    public isDesktop() : boolean {
        return !mw.isMobileDevice();
    }
}
