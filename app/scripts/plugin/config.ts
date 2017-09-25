import { PlayerAdaptorApi } from './player-adaptor-api';

interface WidgetSizeConfig {
    min?: number;
    max?: number;
}

interface WidgetAlignConfig {
    vertical?: string;
    horizontal?: string;
}

interface WidgetDockConfig {
    enable?: boolean;
    positions?: string[];
    'default'?: boolean;
}

interface ThreadConfig {
    showReplies?: boolean;
}

interface PlayerConfig {
    type: string;
    element?: string | Element;
    api?: PlayerAdaptorApi;
    wide?: boolean;
    params?: any;
}

interface TimelineConfig {
    embedded?: boolean;
    height?: number;
    overlayVideo?: boolean;
    disableDockPadding?: boolean;
    positionTopInFullScreen?: boolean;
    scrubberAlwaysOn?: boolean;
    scrubberHeight?: number;
    scrubberColor?: string;
}

interface WidgetConfig {
    player: PlayerConfig;
    timeline?: TimelineConfig;
    openOnLoad?: false;
    demoDiscussion?: string;
}

interface LaunchSourceConfig {
    accessToken?: string;
    consumerKey?: string;
    origin?: string;
}

export interface AnnotoConfig {
    clientId: string;
    position?: string;
    phonePosition?: string;
    relativePositionElement?: string | Element;
    align?: WidgetAlignConfig;
    width?: WidgetSizeConfig;
    height?: WidgetSizeConfig;
    adaptToElement?: boolean;
    enableDraggable?: boolean;
    simple?: boolean;
    rtl?: boolean;
    locale?: string;
    dock?: WidgetDockConfig;
    widgets: WidgetConfig[];
    thread?: ThreadConfig;
    demoMode: boolean;
    launchSource?: LaunchSourceConfig;
}
