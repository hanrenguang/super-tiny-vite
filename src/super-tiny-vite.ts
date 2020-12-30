import path from 'path';
import Koa from 'koa';
import { ServerPluginStaticAsset } from './plugins/serverPluginStaticAsset';
import { config } from './vite.config';

export interface ServerPluginContext {
    app: Koa,
    root: string
};

export type ServerPluginFactor = (context: ServerPluginContext) => void;

// create a server
export function createServer() {
    const { port, root } = config;
    const absoluteRootPath: string = path.resolve(__dirname, root) || '/';

    const app = new Koa();
    const context: ServerPluginContext = { app, root: absoluteRootPath };

    const plugins: ServerPluginFactor[] = getPlugins();
    plugins.forEach(plugin => plugin && plugin(context));

    app.listen(port, () => {
        console.log(` Server is running at http://localhost:${port}`);
    });
}

// get all plugins
export function getPlugins(): ServerPluginFactor[] {
    return [
        ServerPluginStaticAsset
    ];
};

// run server
createServer();