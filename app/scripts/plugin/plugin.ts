import '../../styles/plugin.scss';
import { PluginCtx, PluginConfiguration, Player, MediaEtry } from './mw';
import { Logger } from './logger';
import { AnnotoConfig, AnnotoApi, Annoto as AnnotoMain, AnnotoUxEvent } from '@annoto/widget-api';
import { PlayerAdaptor } from './player-adaptor';
// import { DeviceDetector } from './device-detector';

declare const $: JQueryStatic;

declare const Annoto: AnnotoMain;

export class AnnotoPlugin {

    private player: Player;
    private ctx: PluginCtx;
    private $el: JQuery;
    private isWidgetBooted: boolean = false;
    private isConfigSetup: boolean = false;
    private isReadyToBoot: boolean = false;
    private annotoApi: AnnotoApi;
    private config: AnnotoConfig;
    private adaptor: PlayerAdaptor;
    // private deviceDetector: DeviceDetector;
    private openState: boolean = false;
    private disabledState: boolean = false;
    private isSidePanelLayout: boolean = false;

    constructor(ctx: PluginCtx) {
        this.ctx = ctx;
    }

    static defaultConfig: PluginConfiguration = {
        // parent: 'videoHolder',
        // order: 100,
        // displayImportance: 'low',
        // visible: true,

        // custom property and custom value
        customerKey: '',
        demoMode: false,
        position: 'right',
        locale: 'en',
        sidePanelLayout: false,
        sidePanelFullScreen: false,
        sidePaneClosedOnLoad: false,
        disableComments: false,
        disableNotes: false,
    };

    public isSafeEnviornment() : boolean {
        const width = screenWidth();

        const height = window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight;

        if ((width < 320) || (height < 225)) {
            return false;
        }
        return true;
    }

    public setup(ctx: PluginCtx) {
        this.ctx = ctx;
        this.player = this.ctx.getPlayer();
        this.adaptor = new PlayerAdaptor(ctx);
        // this.deviceDetector = new DeviceDetector();

        this.setupConfigAndBootIfReady();
    }

    public bootWidgetIfReady() {
        if (!this.annotoBootstrapIsLoaded() || !this.isReadyToBoot || !this.player) {
            return;
        }
        this.bootWidget();
    }

    public onEnable() {
        this.disabledState = false;
        Logger.log('Enabled');
        if (this.openState) {
            setTimeout(() => this.showWidget(), 50);
        }
    }

    public onDisable() {
        this.disabledState = true;
        this.hideWidget().then(() => Logger.log('Disabled')).catch((err) => {
            Logger.error('onDisable: ', err);
        });
    }

    public destroy() {
        this.disabledState = true;
        this.closeWidget().then(() => Logger.log('destroyed')).catch((err) => {
            Logger.error('destroying: ', err);
        });
        this.ctx._super();
    }

    private setupLayout(config: AnnotoConfig) {
        const ux = config.ux;
        const features = config.features || {};
        const noWidget = features.comments === false && features.privateNotes === false;
        const isLeft = config.position === 'left';
        const isPlaylist = this.player.isPlaylistScreen() || $('.playlistInterface').length > 0;
        const isSidePanelLayout = !noWidget &&
            !!(ux.sidePanelLayout || this.ctx.getConfig('sidePanelLayout')) &&
            (!isPlaylist || isPlaylist && screenWidth() > 1100);
        const isFullScreenSidePanel = isSidePanelLayout && !!(ux.sidePanelFullScreen ||
            this.ctx.getConfig('sidePanelFullScreen'));
        const sidePaneClosedOnLoad = ux.openOnLoad === false ||
            this.ctx.getConfig('sidePaneClosedOnLoad');

        if (isSidePanelLayout && $('.nnk-side-panel').length === 0) {
            $('.mwPlayerContainer').wrap(`<div class="nnk-side-panel${
                isFullScreenSidePanel ? ' nnk-always-on' : ''
            }${
                isLeft ? ' nnk-left' : ''
            }"></div>`);
            $('.nnk-side-panel').append('<div id="annoto-app"></div>');
            try {
                // try to expand the player should work for MediaSpace
                this.player.getPluginInstance('expandToggleBtn').getBtn().click();
            } catch (err) {}
            this.player.bindHelper('onOpenFullScreen', () => {
                $('.nnk-side-panel').addClass('nnk-fullscreen');
            });
            this.player.bindHelper('onCloseFullScreen', () => {
                $('.nnk-side-panel').removeClass('nnk-fullscreen');
            });
            ux.maxWidth = 360;
            if (isPlaylist) {
                $('body').addClass('nnk-playlist-layout');
            }
            if (sidePaneClosedOnLoad) {
                ux.openOnLoad = false;
                $('.nnk-side-panel').addClass('nnk-hidden');
            }
        }
        ux.sidePanelLayout = isSidePanelLayout;
        ux.sidePanelFullScreen = isFullScreenSidePanel;
        this.isSidePanelLayout = isSidePanelLayout;
    }

    private listenForEntryUpdates() {
        this.player.bindHelper('annotoPluginEntryUpdate', (ev: any, entry: MediaEtry) => {
            const etnryId = this.player.evaluate('{mediaProxy.entry.id}');
            if (entry && entry.id !== etnryId) {
                // do not allow entierly different entry changes
                // this is intended for entry object updates
                return;
            }
            if (this.adaptor && entry.recordedEntryId) {
                this.adaptor.updateMediaEntry(entry);
            }
        });
    }

    private setupConfigAndBootIfReady() {
        if (this.isConfigSetup) {
            return;
        }

        const demoMode = this.ctx.getConfig('demoMode') || !this.customerKeyIsValid();
        const locale = this.ctx.getConfig('locale');
        const disableTimeline = this.player.isLive() && !this.player.isDVR();
        const disableComments = this.ctx.getConfig('disableComments');
        const disableNotes = this.ctx.getConfig('disableNotes');
        this.config = {
            demoMode,
            locale,
            clientId: this.ctx.getConfig('customerKey'),
            position: this.ctx.getConfig('position'),
            launchSource: this.ctx.getConfig('launchSource'),
            align: {
                horizontal: 'inner',
                vertical: 'center',
            },
            ux: {},
            features: {
                timeline: !disableTimeline,
                comments: !disableComments,
                privateNotes: !disableNotes,
            },
            zIndex: 1000,
            fsZIndex: 10000,
            widgets: [
                {
                    player: {
                        type: 'custom',
                        element: $('.mwPlayerContainer').get(0),
                        api: this.adaptor,
                    },
                    timeline: {
                        overlayVideo: true,
                    },
                },
            ],
        };

        const setupEventParams: {
            config: AnnotoConfig,
            await?: (cb: () => void) => void,
        } = {
            config: this.config,
        };
        this.player.triggerHelper('annotoPluginSetup', setupEventParams);
        this.isConfigSetup = true;

        const doBoot = () => {
            this.setupLayout(this.config);
            this.isReadyToBoot = true;
            this.bootWidgetIfReady();
        };

        if (setupEventParams.await) {
            setupEventParams.await(() => doBoot());
        } else {
            doBoot();
        }
    }

    private bootWidget() {
        if (this.isWidgetBooted) {
            return;
        }

        Annoto.boot(this.config);
        this.isWidgetBooted = true;
        Annoto.on('ready', (api: AnnotoApi) => {
            this.annotoApi = api;
            // this.annotoApi.registerDeviceDetector(this.deviceDetector);
            this.player.triggerHelper('annotoPluginReady', this.annotoApi);
        });
        Annoto.on('ux', (uxEvent: AnnotoUxEvent) => {
            if (this.disabledState || this.ctx.isDisabled) {
                return;
            }
            if (uxEvent.name === 'widget:show') {
                this.openState = true;
                if (this.isSidePanelLayout) {
                    $('.nnk-side-panel').removeClass('nnk-hidden');
                    setTimeout(() => this.player.triggerHelper('resizeEvent'), 100);
                }
            } else if (uxEvent.name === 'widget:hide') {
                this.openState = false;
                if (this.isSidePanelLayout) {
                    $('.nnk-side-panel').addClass('nnk-hidden');
                    setTimeout(() => this.player.triggerHelper('resizeEvent'), 100);
                }
            } else if (uxEvent.name === 'widget:minimise') {
                if (this.isSidePanelLayout) {
                    $('.nnk-side-panel').addClass('nnk-hidden');
                    setTimeout(() => this.player.triggerHelper('resizeEvent'), 100);
                }
            }
        });
        this.listenForEntryUpdates();
    }

    private loadWidget() {
        if (this.annotoApi) {
            return this.annotoApi.load(this.config);
        }
        return Promise.reject(new Error('API not ready'));
    }

    private closeWidget() : Promise<void> {
        if (this.annotoApi) {
            return this.annotoApi.close();
        }
        return Promise.resolve();
    }

    private hideWidget() : Promise<void> {
        if (this.annotoApi) {
            return this.annotoApi.hide();
        }
        return Promise.resolve();
    }

    private showWidget() : Promise<void> {
        if (this.annotoApi) {
            return this.annotoApi.show();
        }
        return Promise.resolve();
    }

    private customerKeyIsValid() {
        const key = this.ctx.getConfig('customerKey');
        return (typeof key === 'string') && (key !== '');
    }

    private annotoBootstrapIsLoaded() {
        return ((typeof Annoto === 'object') || (typeof Annoto === 'function'))
            && (typeof Annoto.boot === 'function');
    }
}

const screenWidth = () => {
    return window.innerWidth
    || document.documentElement.clientWidth
    || document.body.clientWidth;
};
