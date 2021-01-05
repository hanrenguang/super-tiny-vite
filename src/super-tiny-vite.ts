import path from 'path';
import Koa from 'koa';
import chalk from 'chalk';
import { ServerPluginStaticAsset } from './plugins/serverPluginStaticAsset';
import { resolver, InternalResolver } from './utils/resolver';
import { config } from './vite.config';

export interface ServerPluginContext {
    app: Koa,
    resolver: InternalResolver,
    root: string
};

export type ServerPluginFactor = (context: ServerPluginContext) => void;

// create a server
export function createServer() {
    const { port, root } = config;
    const absoluteRootPath: string = path.resolve(__dirname, root) || '/';

    const app = new Koa();
    const context: ServerPluginContext = { app, resolver, root: absoluteRootPath };

    const plugins: ServerPluginFactor[] = getPlugins();
    plugins.forEach(plugin => plugin && plugin(context));

    app.listen(port, () => {
        console.log(`\n Server is running at ` + chalk.cyan(`http://localhost:${port}`));
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