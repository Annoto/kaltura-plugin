export interface DeviceDetectorApi {
    isSmallScreen: () => boolean;
    isPhone: () => boolean;
    isTablet: () => boolean;
    isDesktop: () => boolean;
}
