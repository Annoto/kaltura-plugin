import '../../styles/plugin.scss';
import { PluginCtx, PluginConfiguration, Player, MediaEtry } from './mw';
import { Logger } from './logger';
import { IConfig, IAnnotoApi, Annoto as AnnotoMain, IUxEvent } from '@annoto/widget-api';
import { PlayerAdaptor } from './player-adaptor';

declare const $: JQueryStatic;

declare const Annoto: AnnotoMain;

export class AnnotoPlugin {

    private player: Player;
    private ctx: PluginCtx;
    private $el: JQuery;
    private isWidgetBooted: boolean = false;
    private isConfigSetup: boolean = false;
    private isReadyToBoot: boolean = false;
    private annotoApi: IAnnotoApi;
    private config: IConfig;
    private adaptor: PlayerAdaptor;
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
        theme: 'default',
    };

    public isSafeEnviornment() : boolean {
        /* const width = screenWidth();

        if ((width < 320)) {
            Logger.warn('Player is too small. Min supported width: 320px');
            return false;
        } */
        return true;
    }

    public setup(ctx: PluginCtx) {
        Logger.log('setup');
        this.ctx = ctx;
        this.player = this.ctx.getPlayer();
        this.adaptor = new PlayerAdaptor(ctx);

        this.setupConfigAndBootIfReady();
    }

    public bootWidgetIfReady() {
        if (!this.annotoBootstrapIsLoaded() || !this.isReadyToBoot || !this.player) {
            Logger.log('not ready to bootWidget');
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

    private setupLayout() {
        const config = this.config;
        const ux = config.ux || {};
        const features = config.features || {};
        const noWidget = !features.comments?.enabled && !features.notes?.enabled;
        const isLeft = ux.widget?.position === 'left';
        const isPlaylist = this.player.isPlaylistScreen() || $('.playlistInterface').length > 0;
        const isSidePanelLayout = !noWidget &&
            !!(ux.widget?.layout === 'sidePanel' || ux.widget?.layout === 'sidePanelOverlay' || this.ctx.getConfig('sidePanelLayout')) &&
            (!isPlaylist || isPlaylist && screenWidth() > 1100);
        const isFullScreenSidePanel = isSidePanelLayout && !!(ux.widget?.sidePanel?.fullScreenEnable ||
            this.ctx.getConfig('sidePanelFullScreen'));
        const sidePaneClosedOnLoad = (ux.widget?.loadState && ux.widget?.loadState !== 'open') ||
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
            ux.widget.maxWidth = 360;
            if (isPlaylist) {
                $('body').addClass('nnk-playlist-layout');
            }
            if (sidePaneClosedOnLoad) {
                $('.nnk-side-panel').addClass('nnk-hidden');
            } else {
                ux.widget.loadState = 'open';
                this.openState = true;
            }
        }
        if (isSidePanelLayout) {
            ux.widget.layout = 'sidePanel';
            this.isSidePanelLayout = true;
        }
        if (isFullScreenSidePanel) {
            ux.widget.sidePanel = ux.widget.sidePanel || {};
            ux.widget.sidePanel.fullScreenEnable = true;
        }
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
            launchSource: this.ctx.getConfig('launchSource'),
            ux: {
                theme: this.ctx.getConfig('theme'),
                widget: {
                    position: this.ctx.getConfig('position'),
                    layout: 'overlay',
                }
            },
            features: {
                timeline: { enabled: !disableTimeline },
                comments: { enabled: !disableComments },
                notes: { enabled: !disableNotes },
            },
            zIndex: 1000,
            fsZIndex: 10000,
            widgets: [
                {
                    player: {
                        type: 'custom',
                        element: $('.mwPlayerContainer').get(0),
                        adaptorApi: this.adaptor,
                    },
                    timeline: {
                        overlay: true,
                    },
                },
            ],
        };

        const setupEventParams: {
            config: IConfig,
            await?: (cb: () => void) => void,
        } = {
            config: this.config,
        };
        this.player.triggerHelper('annotoPluginSetup', setupEventParams);
        this.isConfigSetup = true;

        const doBoot = () => {
            this.setupLayout();
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
        Annoto.on('ready', (api: IAnnotoApi) => {
            this.annotoApi = api;
            this.player.triggerHelper('annotoPluginReady', this.annotoApi);
        });
        Annoto.on('ux', (uxEvent: IUxEvent) => {
            if (uxEvent.name === 'widget:show') {
                if (this.isSidePanelLayout) {
                    $('.nnk-side-panel').removeClass('nnk-hidden');
                    setTimeout(() => this.player.triggerHelper('resizeEvent'), 100);
                }
                if (!this.disabledState) {
                    this.openState = true;
                }
            } else if (uxEvent.name === 'widget:hide') {
                if (this.isSidePanelLayout) {
                    $('.nnk-side-panel').addClass('nnk-hidden');
                    setTimeout(() => this.player.triggerHelper('resizeEvent'), 100);
                }
                if (!this.disabledState) {
                    this.openState = false;
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
            return this.annotoApi.destroy();
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
