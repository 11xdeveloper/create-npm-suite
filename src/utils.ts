import {
    copyFileSync as cp,
    existsSync as fsExists,
    mkdirSync as mkdir,
    readdirSync as ls,
    statSync as fsGet,
    writeFileSync as fsWrite
} from 'node:fs';

import { join as joinPaths, resolve as resolvePaths } from 'node:path';

export const copy = (src: string, dest: string) => {
    if (!fsExists(dest)) mkdir(dest, { recursive: true });

    for (const item of ls(src)) {
        const path = joinPaths(src, item);
        const target = joinPaths(dest, item);
        const itemObject = fsGet(path);

        if (itemObject.isDirectory()) copy(path, target);
        else cp(path, target);
    }
};

export const write = (file: string, data: string) => {
    const dir = resolvePaths(file, '..');
    if (!fsExists(dir)) mkdir(dir, { recursive: true });
    fsWrite(file, data);
};
