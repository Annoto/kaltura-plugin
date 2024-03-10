import {
    IConfig,
    IAnnotoApi,
    Annoto as AnnotoMain,
    IUxEvent,
} from '@annoto/widget-api';
import '../../styles/plugin.scss';
import { PluginCtx, PluginConfiguration, Player, MediaEtry } from './mw';
import { Logger } from './logger';
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
    private widgetIndex: number;
    private adaptor: PlayerAdaptor;
    private openState: boolean = false;
    private disabledState: boolean = false;
    private setupLayoutCalled: boolean = false;

    constructor(ctx: PluginCtx) {
        this.ctx = ctx;
    }

    static defaultConfig: Partial<PluginConfiguration> = {
        // parent: 'videoHolder',
        // order: 100,
        // displayImportance: 'low',
        // visible: true,

        // custom property and custom value
        // customerKey: '',
        // position: 'right',
        // locale: 'en',
        // sidePanelLayout: false,
        // sidePanelFullScreen: false,
        // disableComments: false,
        // disableNotes: false,
        // theme: 'default',
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
        if (this.annotoApi.getWidgetState() === 'hidden') {
            setTimeout(() => this.player.triggerHelper('resizeEvent'), 100);
            this.setupLayoutCalled = true;
            return;
        }
        const ux = this.config.widgets[this.widgetIndex]?.ux;
        if (!ux) {
            Logger.warn('widget ux for setupLyaout not found');
            this.setupLayoutCalled = true;
            return;
        }
        const isSidePanelLayout = !!(ux.layout === 'sidePanel' || this.ctx.getConfig('sidePanelLayout'));
        if (isSidePanelLayout) {
            ux.layout = 'sidePanel';
        }
        // Check class of the expand button to see if it is in extended mode already
        if (isSidePanelLayout && !this.setupLayoutCalled) {
            try {
                // try to expand the player should work for MediaSpace
                const expandBtn = this.player.getPluginInstance('expandToggleBtn')?.getBtn();
                if (expandBtn.hasClass('icon-fullscreen-alt')) {
                    expandBtn.click();
                }
            } catch (err) {}
        }
        this.setupLayoutCalled = true;
        const isFullScreenSidePanel = !!(ux.sidePanel.fullScreenEnable || this.ctx.getConfig('sidePanelFullScreen'));
        if (isFullScreenSidePanel) {
            ux.sidePanel.fullScreenEnable = true;
        }
        setTimeout(() => this.player.triggerHelper('resizeEvent'), 100);
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

    private async setupConfigAndBootIfReady() {
        if (this.isConfigSetup) {
            return;
        }

        this.config = {
            clientId: this.ctx.getConfig('customerKey'),
            launchSource: this.ctx.getConfig('launchSource'),
            zIndex: 1000,
            fsZIndex: 10000,
            widgets: [
                {
                    player: {
                        type: 'custom',
                        element: $('.playlistInterface').get(0) || $('.mwPlayerContainer').get(0),
                        adaptorApi: this.adaptor,
                    },
                    timeline: {
                        overlay: true,
                    },
                    ux: { sidePanel: {} },
                    features: {},
                },
            ],
            hooks: {
                setup: this.setupWidgetConfig,
            },
            ux: {},
            backend: {
                domain: this.ctx.getConfig('domain'),
            },
        };
        this.widgetIndex = 0;

        this.isConfigSetup = true;
        await this.setupEventTriggerHandle({ isBootConfig: true });
        this.isReadyToBoot = true;
        this.bootWidgetIfReady();
    }

    private setupWidgetConfig = async (params: { widgetIndex: number; config: IConfig; mediaSrc: string; }): Promise<IConfig | undefined> => {
        const { player, ctx } = this;
        const locale = ctx.getConfig('locale');
        const disableTimeline = player.isLive() && !player.isDVR();
        const disableComments = ctx.getConfig('disableComments');
        const disableNotes = ctx.getConfig('disableNotes');
        const position = ctx.getConfig('position');
        const theme = ctx.getConfig('theme');

        this.widgetIndex = params.widgetIndex;
        const config = this.config = params.config;
        if (locale) {
            config.locale = locale;
        }
        if (theme) {
            config.ux.theme = theme;
        }
        const widget = config.widgets[params.widgetIndex];
        if (widget) {
            if (disableTimeline) {
                widget.features.timeline = { enabled: false };
            }
            if (disableComments) {
                widget.features.comments = { enabled: false };
            }
            if (disableNotes) {
                widget.features.notes = { enabled: false };
            }
            if (position) {
                widget.ux.position = position;
            }
            if (widget.ux.layout === 'edge' || widget.ux.layout === 'fixed') {
                widget.ux.layout = 'overlay';
            }   
        } else {
            Logger.warn('widget not found for setupWidgetConfig');
        }

        await this.setupEventTriggerHandle();
        this.setupLayout();
        return this.config;
    }

    private async setupEventTriggerHandle({ isBootConfig }: { isBootConfig?: boolean; } = {}) {
        const setupEventParams: {
            config: IConfig,
            await?: (cb: () => void) => void,
            isBootConfig: boolean;
        } = {
            isBootConfig: !!isBootConfig,
            config: this.config,
        };
        this.player.triggerHelper('annotoPluginSetup', setupEventParams);

        return new Promise<void>((resolve) => {
            const done = () => {
                this.config = setupEventParams.config || this.config;
                resolve();
            };
            if (setupEventParams.await) {
                setupEventParams.await(done);
            } else {
                done();
            }
        });
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
                if (!this.disabledState) {
                    this.openState = true;
                }
            } else if (uxEvent.name === 'widget:hide') {
                if (!this.disabledState) {
                    this.openState = false;
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

    private annotoBootstrapIsLoaded() {
        return ((typeof Annoto === 'object') || (typeof Annoto === 'function'))
            && (typeof Annoto.boot === 'function');
    }
}
