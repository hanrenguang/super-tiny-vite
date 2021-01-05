import fs from 'fs-extra';
import path from 'path';

export interface InternalResolver {
    requestToFile(publicPath: string): string
    resolveFilePathPostfix(publicPath: string): string | undefined
};

const isFile = (file: string): boolean => {
    try {
        return fs.statSync(file).isFile();
    } catch (e) {
        return false;
    }
};


export const supportedExts = ['.js'];


function requestToFile(publicPath: string): string {
    let resolved: string = publicPath;
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
        const queryMatch = filePath.match(/\?.*$/);
        const query = queryMatch ? queryMatch[0] : '';
        const resolved = filePath + postfix + query;
        if (resolved !== filePath) {
            return postfix;
        }
    }
}

export const resolver: InternalResolver = {
    requestToFile,
    resolveFilePathPostfix
};