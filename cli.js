#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import {exportData} from './index.js'



yargs(hideBin(process.argv))
    .option('url', {
        describe: 'The url to export data from',
        type: 'string',
        demandOption: true,
    })
    .option('jwt', {
        describe: 'The JWT token',
        type: 'string',
        demandOption: true,
    })
    .option('file', {
        describe: 'The file to save data to',
        type: 'string',
        demandOption: false,
    })
    .help()
    .parseAsync()
    .then((argv) => {
        exportData(argv.url, argv.jwt, argv.file).catch((error) =>
            console.error(error)
        );
    });
