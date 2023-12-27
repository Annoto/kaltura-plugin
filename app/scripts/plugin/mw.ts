import { ILaunchSourceConfig, ThemeType, WidgetPositionType } from '@annoto/widget-api';

interface PluginConfiguration {
    // Standard Kaltura plugin config
    plugin?: true;
    iframeHTML5Js?: string;
    parent?: string;
    order?: number;
    displayImportance?: string;
    align?: string;
    visible?: boolean;

    // Annoto Config
    customerKey?: string;
    launchSource?: ILaunchSourceConfig;
    demoMode?: boolean;
    position?: WidgetPositionType;
    locale?: string;
    sidePanelLayout?: boolean;
    sidePanelFullScreen?: boolean;
    disableComments?: boolean;
    disableNotes?: boolean;
    theme?: ThemeType;
    /**
     * Backend domain to use for example: 'us.annnoto.net'
     * @default 'eu.annoto.net'
     */
    domain?: string;
}

interface AnnotoPluginCtx {
    isSafeEnviornment: () => boolean;
    defaultConfig: PluginConfiguration;
    setup: () => void;
    addBindings?: () => void;
    getComponent?: () => any;
    onDisable: () => void;
    onEnable: () =>  void;
    destroy: () => void;
}

interface Player extends Element {
    /*paused: boolean;
    clientHeight: number;
    clientWidth: number;*/
    autoplay: boolean;
    kpartnerid: number;

    sendNotification: (action: string, arg?: any) => void;
    evaluate: (property: string) => any;
    setKDPAttribute: (selector: string, property: string, val: any) => void;
    isPlaying: () => boolean;
    isInSequence: () => boolean;  // is Playing Ad
    isPlaylistScreen: () => boolean;
    /**
     * Check if Dvr is supported for live stream
     * if not supported, video.player.currentTime will provide seconds since Unix Epoch instead of seconds from start of stream
     */
    isDVR: () => boolean | number;
    /**
     * Check if it's a live stream
     */
    isLive: () => boolean;

    getWidth: () => number;
    getHeight: () => number;
    getPlayerWidth: () => number;
    getPlayerHeight: () => number;
    getPlayerElement: () => Element;
    getInterface: () => JQuery;
    getVideoHolder: () => JQuery;
    getVideoDisplay: () => JQuery;
    getControlBarContainer: () => JQuery;
    getTopBarContainer: () => JQuery;
    getPlayerPoster: () => JQuery;
    getPluginInstance: (name: string) => PluginCtx;
    triggerHelper: (event: string, arg?: any) => void;
    bindHelper: (event: string, cb: Function) => void;
    unbindHelper: (event: string) => void;
    getActiveSubtitle: () => TextTrack;
    getTextTracks: () => KalturaV2TextTrack[];

    layoutBuilder: {
        isInFullScreen: () => boolean;
    };
}

export interface KalturaV2TextTrack extends TextTrack {
    srclang: string;
}

interface MediaEtry {
    dataUrl: string;
    partnerId: number;
    id: string;
    rootEntryId?: string;
    redirectEntryId?: string;
    recordedEntryId?: string;
    userId?: string;
    thumbnailUrl: string;
    name: string;
    description?: string;
    creditUserName?: string;
    creatorId?: string;
    downloadUrl?: string;
    groupId?: string;
    searchText?: string;
    categories?: string;
}

interface PluginCtx extends AnnotoPluginCtx {
    getPlayer: () => Player;
    bind: (event: string, cb: () => void) => void;
    unbind: (event?: string) => void;
    getConfig: (option: string) => any;
    hide: () => void;
    show: () => void;
    getMenu: () => {
        $el: Element[];
    };
    getCssClass: () => string;
    getBtn: () => any;
    isDisabled: boolean;
    safe: boolean;
    _super: () => void;
}

export { PluginCtx, PluginConfiguration, AnnotoPluginCtx, Player, MediaEtry };

/**
 * Events
 *
 onChangeMediaDone
 resize
 resizeEvent
 onToggleFullscreen
 onOpenFullScreen
 onCloseFullScreen
 durationChange
 doPlay
 doPause
 onplay
 onpause
 onShowControlBar
 onHideControlBar
 showPlayerControls
 hidePlayerControls
 playerSizeClassUpdate
 analyticsEvent
 liveAnalyticsEvent
 prePlayAction
 firstPlay
 playing
 replayEvent
 userInitiatedPlay
 userInitiatedPause
 goingtoplay
 liveOnline
 timeupdate
 detachTimeUpdate
 reattachTimeUpdate
 userInitiatedSeek
 onShowSideBar
 clearTooltip
 onComponentsHoverDisabled
 onHideSideBar
 onComponentsHoverEnabled
 updateComponentsVisibilityDone
 streamsReady
 onChangeStream
 freezeTimeIndicators
 KalturaSupport_EntryDataReady
 KalturaSupport_CuePointsReady
 onChangeStreamDone
 onPlayerStateChange
 onChangeStreamDone
 onShowToplBar
 onHideTopBar
 preSeek
 seeking
 updateLayout
 playerError
 embedPlayerError
 directDownloadLink
 widgetLoaded
 getShareIframeSrc
 preSequence
 addLayoutComponent
 addLayoutContainer
 layoutBuildDone
 addControlBindingsEvent
 AddEmptyBlackSources
 volumeChanged
 textTracksReceived
 liveEventEnded
 bitrateChange
 liveStreamStatusUpdate
 onTextData
 onEmbeddedData
 audioTracksReceived
 audioTrackIndexChanged
 debugInfoReceived
 readyToPlay
 onId3Tag
 SourceSelected
 movingBackToLive
 preHideScreen
 hideScreen
 preShowScreen
 showScreen
 closeOpenScreens
 hideMobileComponents
 updateComponentsVisibilityDone
 showMobileComponents
 showLargePlayBtn
 slideAnimationEnded
 * */
