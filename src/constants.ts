export const packageManagers = ['npm', 'yarn', 'pnpm', 'bun'] as const;

export const languages = ['JavaScript', 'TypeScript'] as const;
export const linters = ['ESLint', 'tsc', 'none'] as const;

export type TPackageManager = (typeof packageManagers)[number];
export type TLanguage = (typeof languages)[number];
export type TLinter = (typeof linters)[number];

export const packageManager: TPackageManager = ((x: string | undefined) =>
    x ? (x.split(' ')[0].split('/')[0] as TPackageManager) : 'npm')(
    process.env.npm_config_user_agent
);

const workflowPackageManager = `${
    packageManager === 'bun'
        ? `- uses: oven-sh/setup-bun@v1
              with:
                bun-version: ^1.0.0`
        : packageManager === 'yarn'
          ? `- uses: borales/actions-yarn@v4`
          : `- uses: pnpm/action-setup@v2
        with:
          version: ^8.0.0`
}      ${
    packageManager == 'bun'
        ? ''
        : `- uses: actions/setup-node@v3
        with:
          node-version: ^20.0.0
          cache: "${packageManager}"`
}`;

export const indextestts = `${
    packageManager === 'bun' ? 'import { test, expect } from "bun:test"' : ''
}
import sum from '.';
import chalk from 'chalk';

test('sum: sum all given numbers', () => {
    expect(sum(1, 2, 3)).toBe(6);
    expect(sum(40, 200, 30)).toBe(270);
});

`;

export const packagejson = (name: string, repositoryURL: string) => `
{
    "name": "${name}",
    "description": "",
    "main": "dist/index.js",
    "module": "dist/index.mjs",
    "types": "dist/index.d.ts",
    "type": "module",
    "author": {},
    "files": [
        "dist",
        "README.md"
    ],
    "repository": {
        "type": "git",
        "url": "git+${repositoryURL}.git"
    },
    "homepage": "${repositoryURL}#readme",
    "bugs": {
        "url": "${repositoryURL}/issues"
    },
    "keywords": [],
    "license": "MIT",
    "scripts": {
        "build": "rimraf dist && tsup-node",
        "test": "${packageManager == 'bun' ? 'bun test' : 'jest'}",
        "release": "changeset publish",
        "format": "prettier --write .",
        "lint": "tsc --noEmit",
        "check": "${packageManager} run format && ${packageManager} run lint && ${packageManager} run test"
    },
    "devDependencies": {
        "@changesets/cli": "^2.0.0",
        "prettier": "^3.0.0",
        "rimraf": "^5.0.0",
        "tsup": "^8.0.0",
        ${
            packageManager === 'bun'
                ? '"bun-types": "^1.0.0",'
                : `"jest": "^29.0.0",
        "ts-jest": "^29.0.0",
        "@types/jest": "^29.0.0",`
        }
        "typescript": "^5.0.0"
    }
}
`;

export const mainyaml = `
name: CI
on:
    push:
        branches:
            - '**'

jobs:
    build:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3
            ${workflowPackageManager}

            - run: ${packageManager} install --frozen-lockfile
            - run: ${packageManager} run check
`;

export const publishyaml = `
name: Publish
on:
    workflow_run:
        workflows: ['CI']
        types:
            - completed
    push:
        branches:
            - 'master'

concurrency: ${'${{ github.workflow }}-${{ github.ref }}'}

jobs:
    publish:
        if: ${"${{ github.event.workflow_run.conclusion == 'success' }}"}
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3
            ${workflowPackageManager}

            - run: ${packageManager} install --frozen-lockfile
            - name: Create Release Pull Request or Publish
              id: changesets
              uses: changesets/action@v1
              with:
                  publish: ${packageManager} run release
              env:
                  GITHUB_TOKEN: ${'${{ secrets.GITHUB_TOKEN }}'}
                  NPM_TOKEN: ${'${{ secrets.NPM_TOKEN }}'}
`;

export const tsconfigjson = `
{
    "compilerOptions": {
        "lib": ["ESNext"],
        "module": "ESNext",
        "target": "ESNext",
        "moduleResolution": "${packageManager === 'bun' ? 'Bundler' : 'Node'}",
        "moduleDetection": "force",
        "noEmit": true,
        "composite": true,
        "strict": true,
        "downlevelIteration": true,
        "skipLibCheck": true,
        "allowSyntheticDefaultImports": true,
        "forceConsistentCasingInFileNames": true,${
            packageManager === 'bun'
                ? `        
        "types": ["bun-types"],
        "allowImportingTsExtensions": true,`
                : ''
        }
        "allowJs": true
    }
}
`;
