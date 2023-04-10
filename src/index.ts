import * as fs from 'fs';
import { stdout } from 'process';
import * as readline from 'readline/promises';
import { Readable } from 'stream';
import { Scanner } from './Scanner';

let hadError: boolean = false;

function run(source: string){
    // Indicate an error in the exit code.
    if (hadError) {
        process.exit(65);
    }

    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();
    for (const token of tokens) {
        console.log(token);
    }
}

export function error(line: number, message: string) {
    report(line, "", message);
}

function report(line: number, where: string, message: string) {
    console.error(`[line ${line}] Error ${where}: ${message}`);
    hadError = true;
}

function runFile(path: string) {
    console.log('runFile: ', path);
    const stringBuffer = fs.readFileSync(path, {encoding: 'utf-8'});
    run(stringBuffer);
}

async function runPrompt() {
    console.log('prompt');
    const rl = readline.createInterface({input: process.stdin, output: process.stdout});

    while(true) {
        const line = await rl.question('>>> ');
        run(line);
        hadError = false;
    }

}

async function main() {
    const args = process.argv.slice(2);

    if (args.length > 1) {
        console.log('Usage jlox [script]');
        process.exit(64);
    } else if (args.length === 1) {
        runFile(args[0]);
    } else {
        await runPrompt();
    }
}

main();
