import { Player, MediaEtry, PluginCtx } from './mw';
import {
    IPlayerAdaptorApi,
    IControlsDescriptor,
    PlayerEventCallback,
    IMediaDetails,
    CaptureUIEventCallback,
} from '@annoto/widget-api';

declare const mw: {
    getMwEmbedPath: () => string;
    kApiGetPartnerClient: () => {
        serviceBase: string,
        serviceUrl: string,
        statsServiceUrl: string,
    },
    isMobileDevice: () => boolean,
};

export class PlayerAdaptor implements IPlayerAdaptorApi {
    private player: Player;
    private ctx: PluginCtx;

    private isAutoplay = false;
    private mediaId: string;
    private timelineContainer: HTMLElement;
    private events: {
        event: string;
        fn: PlayerEventCallback;
    }[] = [];
    protected onMediaChangeCb: PlayerEventCallback;
    private captureUIDispose?: () => void;
    protected updatedEntry: MediaEtry;
    private onTimeUpdateCb?: PlayerEventCallback;
    private timeUpdateOnSeekCalled = false;

    constructor(ctx: PluginCtx) {
        this.ctx = ctx;
        this.player = ctx.getPlayer();
    }

    readonly sidePanelSupported: true;

    public init(element: Element) {
        this.mediaId = this.entryId();
        return true;
    }

    public remove() {
        this.events.forEach(ev => this.ctx.unbind(ev.event));
        this.events = [];
        this.onTimeUpdateCb = undefined;
        this.onMediaChangeCb = undefined;
        this.timeUpdateOnSeekCalled = false;
        if (this.captureUIDispose) {
            this.captureUIDispose();
        }
    }

    public play() {
        this.exec('doPlay');
    }

    public pause() {
        this.exec('doPause');
    }

    public setCurrentTime(time: number) {
        this.exec('doSeek', time);
    }

    public currentTime() : number {
        // Kaltura live without DVR does not support valid current playback time
        if (this.player.isLive() && !this.player.isDVR()) {
            return 0;
        }
        return this.getTimeProperty('{video.player.currentTime}');

    }

    public duration() : number {
        return this.getTimeProperty('{duration}');
    }

    public paused() : boolean {
        return !this.player.isPlaying();
    }

    public mediaSrc() : string {
        const entry: MediaEtry = this.mediaEntry();
        if (!entry) {
            return;
        }
        let partnerId = entry.partnerId;
        if (!partnerId) {
            partnerId = this.player.kpartnerid;
        }
        const id = this.entryId();
        if (!partnerId || !id) {
            return;
        }

        return `/partnerId/${partnerId}/entryId/${id}`;
    }

    public mediaMetadata(): IMediaDetails {
        const entry: MediaEtry = this.mediaEntry();
        if (!entry) {
            return;
        }
        return {
            title: entry.name,
            description: entry.description,
            authorName: entry.userId || entry.creatorId,
            thumbnails: {
                default: entry.thumbnailUrl,
            },
        };
    }

    public isLive(): boolean {
        return !!this.player.isLive();
    }

    public autoplay() : boolean {
        return (typeof this.player.autoplay === 'boolean') ? this.player.autoplay : this.isAutoplay;
    }

    public controlsDescriptor() : IControlsDescriptor {
        return null;
    }

    // If device is mobile, use the fullscreen annoot UX.
    public fullScreen() : boolean {
        return mw.isMobileDevice() || this.player.layoutBuilder.isInFullScreen();
    }

    public width() : number | string {
        const { player } = this;

        return player.getPlayerWidth();
    }

    public height() : number | string {
        const { player } = this;
        const isPlaylist = $('.playlistInterface').length > 0;
        if (isPlaylist) {
            return $('.playlistInterface').height() || player.getHeight();
        }
        return player.getHeight();
    }

    public controlsHidden() : boolean {
        return false;
    }

    public controlsHeight() : number | string {
        return this.player.getControlBarContainer().height();
    }

    captionsOn(language?: string): void {
        const textTracks = this.player.getTextTracks();
        if (!textTracks?.length) {
            return;
        }
        let selectedTextTrack: TextTrack = null;
        if (language) {
            for (let i = 0; i < textTracks.length; i++) {
                if (textTracks[i].srclang === language) {
                    selectedTextTrack = textTracks[i];
                }
            }
        } else if (this.player.getActiveSubtitle()) {
            // no need to enable enabled
            return;
        } else {
            selectedTextTrack = textTracks[0];
        }
        const captionsPlugin = this.player.getPluginInstance('closedCaptions');
        const captionMenuEl = captionsPlugin.getMenu().$el[0];
        const captionSelectEls = captionMenuEl.querySelectorAll('li a');
        captionSelectEls.forEach((el: HTMLElement) => {
            if (el.innerHTML.includes(selectedTextTrack.label)) {
                el.click();
                return;
            }
        })
    }

    public controlsElement() {
        if (this.timelineContainer) {
            return this.timelineContainer;
        }
        this.timelineContainer = document.createElement('DIV');
        this.timelineContainer.setAttribute('style', `
            width: 100%;
            position: absolute;
            bottom: 100%;
        `);
        this.player.getControlBarContainer().prepend(this.timelineContainer);
        return this.timelineContainer;
    }

    public embeddableElement() {
        return $('.mwPlayerContainer').get(0);
    }

    public trackMarginLeft() : number | string {
        return 0;
    }

    public trackMarginRight() : number | string {
        return 0;
    }

    public onReady(cb: PlayerEventCallback) {
        setTimeout(cb);
    }

    public onPlay(cb: PlayerEventCallback) {
        this.on('onplay', () => this.callIfNotAd(cb));
    }

    public onPause(cb: PlayerEventCallback) {
        this.on('onpause', () => this.callIfNotAd(cb));
    }

    public onSeek(cb: PlayerEventCallback) {
        this.on('seeked', () => {
            // When user seeks into the end of the video from paused state, the player will fire 'seeked' event, but not 'timeupdate'
            this.timeUpdateOnSeekCalled = false;
            setTimeout(() => {
                if (!this.timeUpdateOnSeekCalled) {
                    this.timeUpdateHandle()
                }
            });
            this.callIfNotAd(cb)
        });
    }

    public onTimeUpdate(cb: PlayerEventCallback) {
        this.onTimeUpdateCb = cb;
        this.on('timeupdate', () => this.timeUpdateHandle());
    }

    public onMediaChange(cb: PlayerEventCallback) {
        this.onMediaChangeCb = cb;
        this.on('onChangeMediaDone', () => this.mediaChangeHandle());
    }

    public onEnded(cb: PlayerEventCallback) {
        this.on('ended', () => this.callIfNotAd(cb));
    }

    public onFullScreen(cb: (isFullScreen?: boolean) => void) {
        this.on('onOpenFullScreen', () => {
            cb(this.player.layoutBuilder.isInFullScreen());
        });
        this.on('onCloseFullScreen', () => {
            cb(this.player.layoutBuilder.isInFullScreen());
        });
    }

    public onSizeChange(cb: PlayerEventCallback) {
        this.on('resizeEvent', cb);
    }

    onCaptureUIEvent(cb: CaptureUIEventCallback) {
        if (this.captureUIDispose) {
            this.captureUIDispose();
        }
        const controlBarContainer = this.player.getControlBarContainer()[0];
        const sliderRangeEl = controlBarContainer?.querySelector('.ui-slider') as HTMLElement;

        const mouseDownHandler = (ev: MouseEvent) => {
            const { clientX } = ev ;
            const rect = sliderRangeEl.getBoundingClientRect();
            const timestamp = (clientX - rect.x) / rect.width * this.duration();
             cb({ ev, timestamp });
        };

        sliderRangeEl?.addEventListener('mousedown', mouseDownHandler , { capture: true });

        this.captureUIDispose = () => {
            sliderRangeEl?.removeEventListener('mousedown', mouseDownHandler, { capture: true });
        };
    }

    // Implement dummy controls state API
    public onControlsShow(cb: PlayerEventCallback) {
        // this.on('showPlayerControls', cb);
    }
    public onControlsHide(cb: PlayerEventCallback) {
        // this.on('hidePlayerControls', cb);
    }

    public onError(cb: (err?: Error) => void) {
        this.on('playerError', cb);
    }

    public updateMediaEntry(entry?: MediaEtry | null) {
        if (entry || entry === null) {
            this.updatedEntry = entry;
        }
        this.mediaChangeHandle();
    }

    private timeUpdateHandle(): void {
        this.timeUpdateOnSeekCalled = true;
        if (this.onTimeUpdateCb) {
            this.callIfNotAd(this.onTimeUpdateCb);
        }
    }

    protected mediaChangeHandle() {
        if (this.player.isInSequence()) {
            return;
        }

        const entryId = this.entryId();
        if (this.mediaId !== entryId) {
            this.mediaId = entryId;
            if (this.onMediaChangeCb) {
                this.onMediaChangeCb();
            }
        }
    }

    protected mediaEntry(): MediaEtry {
        return this.updatedEntry || this.getProperty('{mediaProxy.entry}');
    }

    protected entryId() : string {
        const entry: MediaEtry = this.mediaEntry();
        if (!entry) {
            return;
        }
        if (!entry.id) {
            return;
        }
        let id = entry.id;
        if (this.isLive()) {
            id = entry.recordedEntryId || entry.id;
        }
        return id;
    }

    private callIfNotAd(cb: PlayerEventCallback) {
        if (!this.player.isInSequence()) {
            cb();
        }
    }

    private exec(action: string, arg?: any) : void {
        this.player.sendNotification(action, arg);
    }

    private getProperty(property: string) : any {
        return this.player.evaluate(property);
    }

    protected getTimeProperty(evaluatedProp: string): number {
        const t = this.getProperty(evaluatedProp);
        let ts: number = t;
        if (typeof t === 'string') {
            ts = parseFloat(t);
        }
        // we expect time to be in seconds relative to start of stream.
        // Sometimes for live the player reports unix epoch time, filer it out.
        if (ts > 1000 * 60 * 60) {
            return 0;
        }
        return ts;
    }

    private on(event: string, fn: PlayerEventCallback) {
        this.ctx.bind(event, fn);
        this.events.push({
            event,
            fn,
        });
    }
}
