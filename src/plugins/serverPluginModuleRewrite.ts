import { ServerPluginFactor } from '../super-tiny-vite';
import {
    init as initLexer,
    parse as parseImports,
    ImportSpecifier
} from 'es-module-lexer';
import resolve from 'resolve';
import fs from 'fs-extra';
import MagicString from 'magic-string';
import path from 'path';
import { readBody } from '../utils/fsUtils';

const bareImportRE = /^[^\/\.]/;

export const ServerPluginModuleRewrite: ServerPluginFactor = ({ app, resolver, root }) => {
    app.use(async (ctx, next) => {
        await next();

        if (ctx.status === 304) {
            return;
        }
        // 解析裸模块路径
        if (
            ctx.body &&
            ctx.response.is('js')
        ) {
            await initLexer;

            const source: string | null = await readBody(ctx.body);
            if (source) {
                let imports: ImportSpecifier[] = [];
                try {
                    imports = parseImports(source)[0];
                } catch (err) {
                    console.error(`parse imports error >>> `, err);
                }
                const magicSource = new MagicString(source);
                
                for (let i = 0; i < imports.length; i++) {
                    const { s: start, e: end } = imports[i];
                    const id = source.substring(start, end);
                    // 裸模块
                    if (bareImportRE.test(id)) {
                        const resolved = resolveImport(root, id);
                        if (resolved) {
                            magicSource.overwrite(start, end, resolved);
                        }
                    }
                }
                ctx.body = magicSource.toString();
            }
        }
    });
};

// 解析模块路径
function resolveImport(root: string, id: string): string {
    let resolved = id;
    let pkgPath = '';
    try {
        pkgPath = resolve.sync(`${id}/package.json`, {
            basedir: root,
            extensions: ['.json'],
            preserveSymlinks: false
        });
    } catch (e) {
        console.error(`failed to resolve package.json for ${id}`);
    }
    // 获取 module 入口文件名
    if (pkgPath) {
        let pkg;
        try {
            pkg = fs.readJSONSync(pkgPath);
        } catch (e) {
            return id;
        }

        let entryPoint: string | undefined;
        for (const field of ['module', 'jsnext', 'jsnext:main', 'browser', 'main']) {
            if (typeof pkg[field] === 'string') {
                entryPoint = pkg[field];
                break;
            }
        }
    
        if (!entryPoint) {
            entryPoint = 'index.js';
        }
        const pkgDir = path.dirname(pkgPath);
        const pkgEntryPath = path.join(pkgDir, entryPoint);
        resolved = path.relative(root, pkgEntryPath);
        // 格式化路径为 ./path/.../file
        resolved = './' + resolved.split(path.sep).join('/');
    }

    return resolved;
}