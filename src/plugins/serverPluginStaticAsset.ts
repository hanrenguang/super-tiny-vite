import { ServerPluginFactor } from '../super-tiny-vite';

export const ServerPluginStaticAsset: ServerPluginFactor = ({ app, root }) => {
    app.use(require('koa-static')(root));

    app.use(async (ctx, next) => {
        console.log(ctx);
        await next();
    });
};