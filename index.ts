import inquirer from 'inquirer';
import {
    copyFile,
    copyFileSync,
    cpSync,
    existsSync,
    mkdirSync,
    readdirSync,
    rmdirSync,
    statSync
} from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join as joinPaths, resolve as resolvePaths } from 'path';

const languages = ['TypeScript', 'TypeScript'] as const;
const linters = ['ESLint', 'tsc', 'none'] as const;

type TLanguage = (typeof languages)[number];
type TLinter = (typeof linters)[number];

const getName = async (): Promise<{ name: string; override: boolean }> => {
    const { name, override } = await inquirer.prompt<{
        name: string;
        override: 'Yes' | 'No' | undefined;
    }>([
        {
            type: 'input',
            name: 'name',
            message: 'Project Name (valid npm package name)',
            default: 'my-npm-package',
            validate(input: string) {
                return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(
                    input
                );
            }
        },
        {
            type: 'list',
            name: 'override',
            prefix: '⚠️  ',
            suffix: '  ⚠️  ',
            message({ name }) {
                return `${name} already exists. Override?`;
            },
            when({ name }) {
                return existsSync(joinPaths(process.cwd(), name));
            },
            choices: ['Yes', 'No'],
            default: 'No',
            askAnswered: true
        }
    ]);

    if (override == 'No') return getName();

    return { name, override: override ? true : false };
};

const { name, override } = await getName();

const language: TLanguage = 'TypeScript';
const linter: TLinter = 'tsc';

const { repo } = await inquirer.prompt<{
    language: TLanguage;
    repo: string;
    linter: TLinter;
}>([
    {
        type: 'input',
        name: 'repo',
        message: 'Github Repository',
        default: 'user/repo'
    },
    {
        type: 'list',
        name: 'language',
        message:
            'Select a Language (im not sorry if you wanted to use javascript)',
        choices: languages,
        default: 'TypeScript'
    },
    {
        type: 'list',
        name: 'linter',
        message: 'Select a Linter',
        choices: linters,
        default: 'tsc',
        validate(input: TLinter, answers) {
            if (input == 'ESLint' || input == 'none')
                console.log(
                    "Too bad, you're getting tsc. This is for your betterment."
                );
            return true;
        }
    }
]);

const packagejson = `
{
    "name": "${name}",
    "version": "0.0.1",
    "description": "",
    "repository": {
      "type": "git",
      "url": "git+https://github.com/${repo}.git"
    },
    "homepage": "https://github.com/${repo}#readme",
    "bugs": {
      "url": "https://github.com/${repo}/issues"
    },
    "keywords": [],
    "author": "",
    "main": "dist/index.js",
    "module": "dist/index.mjs",
    "types": "dist/index.d.ts",
    "scripts": {
      "build": "rimraf dist && tsup",
      "release": "changeset publish",
      "format": "prettier --write .",
      "lint": "tsc --noEmit",
      "check": "bun run format && bun run lint && bun test"
    },
    "devDependencies": {
        "@changesets/cli": "^2.0.0",
        "bun-types": "^1.0.0",
        "prettier": "^3.0.0",
        "rimraf": "^5.0.0",
        "tsup": "^8.0.0",
        "typescript": "^5.0.0"s
    }
}
`;

const target = joinPaths(process.cwd(), name);
const dev = resolvePaths(fileURLToPath(import.meta.url), '..');
console.log(`Scaffolding project in ${target}`);

if (override) rmdirSync(target, { recursive: true });

mkdirSync(target, { recursive: true });

const templatePath = joinPaths(dev, 'template');

const copy = (src: string, dest: string) => {
    if (!existsSync(dest)) {
        mkdirSync(dest, { recursive: true });
    }

    for (const item of readdirSync(src)) {
        const path = joinPaths(src, item);
        const target = joinPaths(dest, item);
        const itemObject = statSync(path);

        if (itemObject.isDirectory()) copy(path, target);
        else copyFileSync(path, target);
    }
};

copy(templatePath, target);
console.log('Done.');

const packageManager = process.env.npm_package_manager;

console.log(packageManager);
