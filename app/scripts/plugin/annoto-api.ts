import { AnnotoConfig } from './config';
import { DeviceDetectorApi } from './device-detector-api';

export interface AnnotoApi {
    load(config: AnnotoConfig, cb?: () => void): Promise<void>;
    close(cb?: () => void): Promise<void>;
    auth(token: string, cb?:() => void): Promise<void>;
    logout(cb?: () => void): Promise<void>;
    registerDeviceDetector(detector: DeviceDetectorApi, cb?: () => void): Promise<void>;
}
