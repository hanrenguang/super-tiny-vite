import fs from 'fs-extra';
import path from 'path';

export interface InternalResolver {
    requestToFile(publicPath: string, root: string): string
    resolveFilePathPostfix(publicPath: string): string | undefined
};

// 判断是否是文件
const isFile = (file: string): boolean => {
    try {
        return fs.statSync(file).isFile();
    } catch (e) {
        return false;
    }
};


export const supportedExts = ['.js'];
export const moduleRE = /^\/@modules\//;

// 解析资源路径
function requestToFile(publicPath: string, root: string): string {
    let resolved: string = path.join(root, publicPath.slice(1));
    const postfix = resolveFilePathPostfix(resolved);

    if (postfix) {
        if (postfix[0] === '/') {
            resolved = path.join(resolved, postfix);
        } else {
            resolved += postfix;
        }
    }
    return resolved;
}

// 补全文件后缀
function resolveFilePathPostfix(filePath: string): string | undefined {
    if (!isFile(filePath)) {
        let postfix = '';
        // traverse all supported extensions
        for (const ext of supportedExts) {
            if (isFile(filePath + ext)) {
                postfix = ext;
                break;
            }
            const defaultFilePath = `/index${ext}`;
            if (isFile(path.join(filePath, defaultFilePath))) {
                postfix = defaultFilePath;
                break;
            }
        }

        const resolved = filePath + postfix;
        if (resolved !== filePath) {
            return postfix;
        }
    }
}

export const resolver: InternalResolver = {
    requestToFile,
    resolveFilePathPostfix
};