#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import {exportData} from './index.js'



yargs(hideBin(process.argv))
    .option('url', {
        describe: 'The url of graphql to export data from',
        type: 'string',
        demandOption: true,
    })
    .option('jwt', {
        describe: 'The JWT token for authentication to the graphql server',
        type: 'string',
        demandOption: true,
    })
    .option('directory-name', {
        describe: 'The directory name to save data to',
        type: 'string',
        demandOption: false,
    })
    .help()
    .parseAsync()
    .then((argv) => {
        exportData(argv.url, argv.jwt, argv.directoryName).catch((error) =>
            console.error(error)
        );
    });
