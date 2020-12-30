import { ServerPluginFactor } from '../super-tiny-vite';

export const ServerPluginStaticAsset: ServerPluginFactor = ({ app }) => {
    app.use(async (ctx, next) => {
        console.log(ctx);
        await next();
    });
};