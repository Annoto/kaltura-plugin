import { AnnotoPluginCtx, PluginCtx } from './mw';
import { AnnotoPlugin, AnnotoPluginOptions } from './plugin';
import { Logger } from './logger';

export { AnnotoPluginOptions };

declare const mw: {
    kalturaPluginWrapper: any,
    PluginManager: any,
    KBaseComponent: any,
};
declare const $: JQueryStatic;

export function init(options: AnnotoPluginOptions) {

    let plugin: AnnotoPlugin;

    const ctx: AnnotoPluginCtx = {
        defaultConfig: AnnotoPlugin.defaultConfig,
        isSafeEnviornment: () => plugin.isSafeEnviornment(),
        setup() { plugin.setup(this as PluginCtx); },
        // getComponent: () => plugin.getComponent(),
        onEnable: () => plugin.onEnable(),
        onDisable: () => plugin.onDisable(),
        destroy: () => plugin.destroy(),
    };

    plugin = new AnnotoPlugin(ctx as PluginCtx, options);

    const initWrapper = function () {
        mw.PluginManager.add('annoto', mw.KBaseComponent.extend(ctx));
    };

    mw.kalturaPluginWrapper(initWrapper);

    $.getScript(options.bootUrl).done(() => {
        Logger.log('loaded annoto bootstrap');
        plugin.bootWidgetIfReady();
        // plugin.bootConfigIfReady();
    }).fail((err) => {
        Logger.error('loading annoto bootstrap', err);
    });

}



