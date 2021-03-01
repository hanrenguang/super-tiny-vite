import { Readable } from 'stream';

// 获取响应体
export async function readBody(
    stream: Readable | Buffer | string | null
): Promise<string | null> {
    if (stream instanceof Readable) {
        return new Promise((resolve, reject) => {
            let res = '';
            stream.on('data', (chunk) => (res += chunk))
                .on('error', reject)
                .on('end', () => {
                    resolve(res);
                });
        })
    } else {
        return !stream || typeof stream === 'string' ? stream : stream.toString();
    }
}