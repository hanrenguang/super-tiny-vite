import fs from 'fs-extra';
import path from 'path';
import { ServerPluginFactor } from '../super-tiny-vite';
import mime from 'mime-types';

export const ServerPluginStaticAsset: ServerPluginFactor = ({ app, resolver, root }) => {
    app.use(async (ctx, next) => {
        const expectsHtml = ctx.headers.accept && ctx.headers.accept.includes('text/html');

        if (!expectsHtml) {
            // complete postfix
            const filePath = resolver.requestToFile(path.join(root, ctx.path));
            if (
                filePath !== ctx.path &&
                fs.existsSync(filePath) &&
                fs.statSync(filePath).isFile()
            ) {
                ctx.body = await fs.readFile(filePath);
                ctx.type = mime.lookup(path.extname(filePath)) || 'application/octet-stream';
            }
        }
    });

    app.use(require('koa-static')(root));
};