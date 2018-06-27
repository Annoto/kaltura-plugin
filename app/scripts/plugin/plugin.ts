import '../../styles/plugin.scss';
import { PluginCtx, PluginConfiguration, Player } from './mw';
import { Logger } from './logger';
import { AnnotoConfig, AnnotoApi } from '@annoto/widget-api';
import { PlayerAdaptor } from './player-adaptor';
import { DeviceDetector } from './device-detector';

declare const $: JQueryStatic;
declare const mw: {
    isMobileDevice: () => boolean,
};

declare const Annoto: {
    boot: (config: AnnotoConfig) => void;
    on: (event: string, cb: (arg: AnnotoApi | void) => void) => void;
};

export interface AnnotoPluginOptions {
    bootUrl: string;
}


export class AnnotoPlugin {

    private player: Player;
    private ctx: PluginCtx;
    private $el: JQuery;
    private hadScrubber: boolean = true;
    private options: AnnotoPluginOptions;
    private bootedWidget: boolean = false;
    private annotoApi: AnnotoApi;
    private config: AnnotoConfig;
    private adaptor: PlayerAdaptor;
    private deviceDetector: DeviceDetector;

    constructor(ctx: PluginCtx, options: AnnotoPluginOptions) {
        this.ctx = ctx;
        this.options = options;
    }

    static defaultConfig: PluginConfiguration = {
        // parent: 'videoHolder',
        // order: 100,
        // displayImportance: 'low',
        // visible: true,

        // custom property and custom value
        customerKey: '',
        demoMode: true,
        position: 'right',
        locale: 'en',
        hideScrubber: false,
        scrubberHeight: 5,
        scrubberColor: '#2ec7e1',
    };

    public isSafeEnviornment() : boolean {
        if (mw.isMobileDevice()) {
            Logger.warn('Mobile Devices are not supported at the moment');
            return false;
        }

        const width = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth;

        const height = window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight;

        if ((width < 320) || (height < 360)) {
            return false;
        }
        return true;
    }

    public setup(ctx: PluginCtx) {
        this.ctx = ctx;
        this.player = this.ctx.getPlayer();
        this.adaptor = new PlayerAdaptor(ctx);
        this.deviceDetector = new DeviceDetector();

        if (this.ctx.getConfig('hideScrubber')) {
            const scrubber = this.player.getPluginInstance('scrubber');
            this.hadScrubber = !!scrubber && scrubber.safe && !scrubber.isDisabled;
        }

        this.bootWidget();
    }

    public bootWidgetIfReady() {
        if (this.player) {
            this.bootWidget();
        }
    }

    /*public bootConfigIfReady() {
        if (this.$el) {
            this.bootWidget();
        }
    }

    public getComponent(): JQuery {
        if (!this.$el) {
            const cssClasses = this.ctx.getCssClass();
            this.$el = $('<div></div>')
                .addClass(`${cssClasses}`)
                .append('<div id="annoto-app"></div>');

            this.bootWidget();
        }
        return this.$el;
    }*/

    public onEnable() {
        this.loadWidget().then(() => Logger.log('Enabled')).catch((err) => {
            Logger.error('onEnable: ', err);
        });
    }

    public onDisable() {
        this.closeWidget().then(() => Logger.log('Disabled')).catch((err) => {
            Logger.error('onDisable: ', err);
        });
    }

    public destroy() {
        this.closeWidget().then(() => Logger.log('destroyed')).catch((err) => {
            Logger.error('destroying: ', err);
        });
        this.ctx._super();
    }

    private disableScrubber() {
        if (!this.player) {
            Logger.warn('could not disable scrubber - player missing');
            return;
        }
        this.player.setKDPAttribute('scrubber', 'visible', false);
        const scrubberPlugin = this.player.getPluginInstance('scrubber');
        if (!scrubberPlugin) {
            return;
        }
        scrubberPlugin.hide();
        scrubberPlugin.onDisable();
    }

    private enableScrubber() {
        if (!this.hadScrubber) {
            return;
        }
        if (!this.player) {
            Logger.warn('could not enable scrubber - player missing');
            return;
        }

        const scrubberPlugin = this.player.getPluginInstance('scrubber');
        if (!scrubberPlugin) {
            return;
        }
        scrubberPlugin.show();
        scrubberPlugin.onEnable();
        this.player.setKDPAttribute('scrubber', 'visible', true);
    }


    private bootWidget() {
        if (this.bootedWidget) {
            return;
        }

        if (!this.ctx.getConfig('demoMode') && !this.customerKeyIsValid()) {
            Logger.warn('customerKey must be specified if demoMode is disabled');
            return;
        }

        const demoMode = this.ctx.getConfig('demoMode') && !this.customerKeyIsValid();
        const locale = this.ctx.getConfig('locale');
        const rtlLocales = ['he'];
        this.config = {
            demoMode,
            locale,
            clientId: this.ctx.getConfig('customerKey'),
            position: this.ctx.getConfig('position'),
            launchSource: this.ctx.getConfig('launchSource'),
            rtl: Boolean(rtlLocales.indexOf(locale) !== -1),
            align: {
                horizontal: 'inner',
                vertical: 'top',
            },
            widgets: [
                {
                    player: {
                        type: 'custom',
                        element: $('.mwPlayerContainer').get(0),
                        api: this.adaptor,
                    },
                    timeline: {
                        embedded: false,
                        overlayVideo: true,
                        scrubberAlwaysOn: this.ctx.getConfig('hideScrubber'),
                        scrubberHeight: Math.min(
                            5,
                            Math.max(2, this.ctx.getConfig('scrubberHeight'))),
                        scrubberColor: this.ctx.getConfig('scrubberColor'),
                    },
                },
            ],
        };

        if (!this.annotoBootstrapIsLoaded()) {
            return;
        }

        Annoto.boot(this.config);
        this.bootedWidget = true;
        Annoto.on('ready', (api: AnnotoApi) => {
            this.annotoApi = api;
            if (this.ctx.getConfig('hideScrubber')) {
                this.disableScrubber();
            }
            this.annotoApi.registerDeviceDetector(this.deviceDetector);
            this.player.triggerHelper('annotoPluginReady', api);
        });
    }

    private loadWidget() {
        if (this.annotoApi) {
            return this.annotoApi.load(this.config).then(() => {
                if (this.ctx.getConfig('hideScrubber')) {
                    this.disableScrubber();
                }
            });
        }
        return Promise.reject(new Error('API not ready'));
    }

    private closeWidget() : Promise<void> {
        if (this.annotoApi) {
            return this.annotoApi.close().then(() => {
                if (this.ctx.getConfig('hideScrubber')) {
                    this.enableScrubber();
                }
            });
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
