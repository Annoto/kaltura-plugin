
interface PluginConfiguration {
    parent?: string;
    order?: number;
    displayImportance?: string;
    align?: string;
    visible?: boolean;
    customerKey: string;
    demoMode: boolean;
    position: string;
    locale?: string;
    hideScrubber: boolean;
    scrubberHeight: number;
    scrubberColor: string;
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

    sendNotification: (action: string, arg?: any) => void;
    evaluate: (property: string) => any;
    setKDPAttribute: (selector: string, property: string, val: any) => void;
    isPlaying: () => boolean;
    isInSequence: () => boolean;  // is Playing Ad

    getWidth: () => number;
    getHeight: () => number;
    getPlayerElement: () => Element;
    getInterface: () => JQuery;
    getVideoHolder: () => JQuery;
    getVideoDisplay: () => JQuery;
    getControlBarContainer: () => JQuery;
    getTopBarContainer: () => JQuery;
    getPlayerPoster: () => JQuery;
    getPluginInstance: (name: string) => PluginCtx;
    triggerHelper: (event: string, arg?: any) => void;

    layoutBuilder: {
        isInFullScreen: () => boolean;
    };
}

interface MediaEtry {
    dataUrl: string;
    partnerId: number;
    id: string;
    thumbnailUrl: string;
}

interface PluginCtx extends AnnotoPluginCtx {
    getPlayer: () => Player;
    bind: (event: string, cb: () => void) => void;
    unbind: (event?: string) => void;
    getConfig: (option: string) => any;
    hide: () => void;
    show: () => void;
    getCssClass: () => string;
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
