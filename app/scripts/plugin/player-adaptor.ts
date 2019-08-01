import { Player, MediaEtry, PluginCtx } from './mw';
import { nextTick } from '../util/next-tick';
import {
    PlayerAdaptorApi,
    ControlsDescriptor,
    PlayerEventCallback,
} from '@annoto/widget-api/lib/player-adaptor';
import { MediaDetails } from '@annoto/widget-api';

declare const mw: {
    getMwEmbedPath: () => string;
    kApiGetPartnerClient: () => {
        serviceBase: string,
        serviceUrl: string,
        statsServiceUrl: string,
    },
    isMobileDevice: () => boolean,
};

export class PlayerAdaptor implements PlayerAdaptorApi {
    private player: Player;
    private ctx: PluginCtx;

    private isAutoplay = false;
    private mediaId: string;
    private timelineContainer: HTMLElement;

    constructor(ctx: PluginCtx) {
        this.ctx = ctx;
        this.player = ctx.getPlayer();
    }

    public init(element: Element) {
        this.updateMediaId();
        return true;
    }

    public remove() {
        this.ctx.unbind();
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
        return this.getProperty('{video.player.currentTime}');
    }

    public duration() : number {
        return this.getProperty('{duration}');
    }

    public paused() : boolean {
        return !this.player.isPlaying();
    }

    public mediaSrc() : string {
        const entry: MediaEtry = this.getProperty('{mediaProxy.entry}');
        if (!entry) {
            return;
        }
        let partnerId = entry.partnerId;
        if (!partnerId) {
            partnerId = this.player.kpartnerid;
        }
        if (!partnerId || !entry.id) {
            return;
        }
        return `/partnerId/${partnerId}/entryId/${entry.id}`;

        /* const kApi = mw.kApiGetPartnerClient();
        const sUrl = (kApi && kApi.serviceUrl) ? kApi.serviceUrl : 'http://cdnapi.kaltura.com';

        return `${sUrl}/partnerId/${partnerId}/entryId/${entry.id}`; */
    }

    public mediaMetadata(): MediaDetails {
        const entry: MediaEtry = this.getProperty('{mediaProxy.entry}');
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
        return !!this.getProperty('{mediaProxy.isLive}');
    }

    public autoplay() : boolean {
        return (typeof this.player.autoplay === 'boolean') ? this.player.autoplay : this.isAutoplay;
    }

    public controlsDescriptor() : ControlsDescriptor {
        return null;
    }

    // If device is mobile, use the fullscreen annoot UX.
    public fullScreen() : boolean {
        return mw.isMobileDevice() || this.player.layoutBuilder.isInFullScreen();
    }

    public width() : number | string {
        // return this.getProperty('{video.player.width}');
        return this.player.getWidth();
    }

    public height() : number | string {
        // return this.getProperty('{video.player.height}');
        return this.player.getHeight();
    }

    public controlsHidden() : boolean {
        return false;
    }

    public controlsHeight() : number | string {
        return this.player.getControlBarContainer().height();
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

    public trackMarginLeft() : number | string {
        return 0;
    }

    public trackMarginRight() : number | string {
        return 0;
    }

    public onReady(cb: PlayerEventCallback) {
        nextTick(cb)();
    }

    public onPlay(cb: PlayerEventCallback) {
        this.on('onplay', () => this.callIfNotAd(cb));
    }

    public onPause(cb: PlayerEventCallback) {
        this.on('onpause', () => this.callIfNotAd(cb));
    }

    public onSeek(cb: PlayerEventCallback) {
        this.on('seeked', () => this.callIfNotAd(cb));
    }

    public onTimeUpdate(cb: PlayerEventCallback) {
        this.on('timeupdate', () => this.callIfNotAd(cb));
    }

    public onMediaChange(cb: PlayerEventCallback) {
        this.on('onChangeMediaDone', () => this.mediaChangeHandle(cb));
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

    private mediaChangeHandle(cb: PlayerEventCallback) {
        if (this.player.isInSequence()) {
            return;
        }

        const entry: MediaEtry = this.getProperty('{mediaProxy.entry}');
        if (this.mediaId !== entry.id) {
            this.mediaId = entry.id;
            cb();
        }
    }

    private callIfNotAd(cb: PlayerEventCallback) {
        if (!this.player.isInSequence()) {
            cb();
        }
    }

    private updateMediaId() {
        const entry: MediaEtry = this.getProperty('{mediaProxy.entry}');
        this.mediaId = entry.id;
    }

    private exec(action: string, arg?: any) : void {
        this.player.sendNotification(action, arg);
    }

    private getProperty(property: string) : any {
        return this.player.evaluate(property);
    }

    private on(event: string, cb: PlayerEventCallback) {
        this.ctx.bind(event, cb);
    }

    private off(event: string) {
        this.ctx.unbind(event);
    }
}
