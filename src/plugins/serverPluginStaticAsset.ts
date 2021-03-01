import fs from 'fs-extra';
import path from 'path';
import { ServerPluginFactor } from '../super-tiny-vite';
import mime from 'mime-types';

const seenUrls = new Set();

export const ServerPluginStaticAsset: ServerPluginFactor = ({ app, resolver, root }) => {
    app.use(async (ctx, next) => {
        if (ctx.body || ctx.status !== 404) {
            return;
        }

        const expectsHtml = ctx.headers.accept && ctx.headers.accept.includes('text/html');
        if (!expectsHtml) {
            // 补全后缀、添加其他信息
            const filePath = resolver.requestToFile(ctx.path, root);
            if (
                filePath !== ctx.path &&
                fs.existsSync(filePath) &&
                fs.statSync(filePath).isFile()
            ) {
                ctx.body = await fs.readFile(filePath);
                ctx.type = mime.lookup(path.extname(filePath)) || 'application/octet-stream';
            }
        }

        await next();
        // 缓存仍新鲜，返回304状态码
        if (seenUrls.has(ctx.url) && ctx.fresh) {
            ctx.status = 304;
        }
        seenUrls.add(ctx.url);
    });
    // 处理静态资源
    app.use(require('koa-etag')());
    app.use(require('koa-static')(root));
};