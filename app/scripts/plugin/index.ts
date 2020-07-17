import { AnnotoPluginCtx, PluginCtx, PluginConfiguration } from './mw';
import { AnnotoPlugin } from './plugin';
import { Logger } from './logger';

export { PluginConfiguration };

export interface PluginInitParams {
    bootUrl: string;
}

declare const mw: {
    kalturaPluginWrapper: any,
    PluginManager: any,
    KBaseComponent: any,
};
declare const $: JQueryStatic;

export function init(params: PluginInitParams) {

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

    plugin = new AnnotoPlugin(ctx as PluginCtx);

    const initWrapper = function () {
        mw.PluginManager.add('annoto', mw.KBaseComponent.extend(ctx));
    };

    mw.kalturaPluginWrapper(initWrapper);

    $.getScript(params.bootUrl).done(() => {
        Logger.log('loaded annoto bootstrap');
        plugin.bootWidgetIfReady();
    }).fail((err) => {
        Logger.error('loading annoto bootstrap', err);
    });

}
