#!/usr/bin/env node

import inquirer from 'inquirer';
import { fileURLToPath as getPath } from 'node:url';
import { rmSync as rm, existsSync as fsExists } from 'node:fs';
import { join as joinPaths, resolve as resolvePaths } from 'path';
import figlet from 'figlet';
import {
    TLanguage,
    languages,
    TLinter,
    linters,
    indextestts,
    mainyaml,
    packageManager,
    packagejson,
    publishyaml
} from './constants';
import { copy, write } from './utils';
import chalk from 'chalk';
import gradient from 'gradient-string';

await figlet('CREATE NPM SUITE', (err, res) => {
    if (err) console.error(err);
    console.log(gradient.fruit.multiline(res));
});

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
                return `${name} already exists. ${chalk.red('Override')}?`;
            },
            when({ name }) {
                return fsExists(joinPaths(process.cwd(), name));
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

const { language } = await inquirer.prompt<{ language: TLanguage }>({
    type: 'list',
    name: 'language',
    message: 'Select a Language',
    choices: languages,
    default: 'TypeScript'
});

if (language == 'JavaScript')
    console.log(
        `Let me fix that for you...😔   Using ${gradient.vice('TypeScript')}!`
    );

const { repo: repositoryURL } = await inquirer.prompt<{
    repo: string;
}>([
    {
        type: 'input',
        name: 'repo',
        message: 'Github Repository',
        default: 'https://github.com/user/repo'
    }
]);

const { linter } = await inquirer.prompt<{
    linter: TLinter;
}>({
    type: 'list',
    name: 'linter',
    message: 'Select a Linter',
    choices: linters,
    default: 'tsc'
});

if (linter !== 'tsc')
    console.log(
        `Too bad, you're getting ${gradient.vice(
            'tsc'
        )}. This is for your ${chalk.magenta('betterment')}.`
    );

const target = joinPaths(process.cwd(), name);
const template = resolvePaths(getPath(import.meta.url), '..', '..', 'template');

console.log(chalk.yellow(`\nScaffolding project in ${target}`));

if (override) rm(target, { recursive: true });

copy(template, target);
write(joinPaths(target, 'package.json'), packagejson(name, repositoryURL));
write(joinPaths(target, 'src', 'sum', 'index.test.ts'), indextestts);
write(joinPaths(target, '.github', 'workflows', 'main.yaml'), mainyaml);
write(joinPaths(target, '.github', 'workflows', 'publish.yaml'), publishyaml);

console.log(`${chalk.greenBright('Success')}

cd ${gradient.rainbow(name)} && ${
    packageManager == 'bun' || packageManager == 'pnpm'
        ? gradient.fruit(packageManager)
        : packageManager == 'yarn'
          ? chalk.blue('yarn')
          : chalk.red('npm')
} install &&
${chalk.gray('git')} remote ${chalk.green('add')} origin ${gradient.cristal(
    `${repositoryURL}.git`
)} && 
${chalk.gray('git')} add . && ${chalk.gray(
    'git'
)} commit -m "Project Setup (${gradient.fruit('create-npm-suite')})"
${gradient.pastel('Happy Developing!')}
`);
