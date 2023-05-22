#!/usr/bin/env node
import pkg from '@apollo/client';
const {gql} = pkg;
import fs from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { stripSymbols } from 'apollo-utilities';
import moment from "moment";
let current_time = Date.now();
import {generateApolloClient,} from "@deep-foundation/hasura/client.js";


function createApolloClient(uri) {
    return generateApolloClient(
        {
            path: uri.replace("https://", ""),
            ssl: 1,
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWFsbG93ZWQtcm9sZXMiOlsiYWRtaW4iXSwieC1oYXN1cmEtZGVmYXVsdC1yb2xlIjoiYWRtaW4iLCJ4LWhhc3VyYS11c2VyLWlkIjoiMzc4In0sImlhdCI6MTY4MzkzODI0Nn0.u_J5KUZZWfUKIyhHprcGbx__a_GrKL1ETwwuwpxz5JQ'
        }
    )
}
async function getMigrationsEndId(client) {
    const result = await client.query({
        query: gql`
            query Links {
                links(where: {type_id: {_eq: "182"}}) {
                    id
                }
            }
        `
    });
    return result.data.links[0].id;
}
function getLinksGreaterThanId(client, id) {
    return client.query({
        query: gql`query ExportLinks {
            links(order_by: { id: asc }, where: { id: { _gte: ${id} } }) {
                id
                from_id
                to_id
                type_id
                object {
                    value
                }
                string {
                    value
                }
                number {
                    value
                }
            }
        }
        `,
    })
}
async function exportData(url, jwt, filename  = `dump-${moment(current_time).format("YYYY-MM-DD-HH-mm-ss")}.json`) {
    const client = createApolloClient(url, jwt)
    getLinksGreaterThanId(client, await getMigrationsEndId(client))
        .then((result) => {
            let links = stripSymbols(result)
            links = links.data.links.slice()
            for (let item of links) {
                if (item?.object?.__typename) {
                    delete item.object.__typename;
                }
                if (item?.string?.__typename) {
                    delete item.string.__typename;
                }
                if (item?.number?.__typename) {
                    delete item.number.__typename;
                }
                if (item?.__typename){
                    delete item.__typename
                }
            }

            fs.writeFileSync(filename, JSON.stringify(links), (err) => {
                if (err) throw err;
                console.log('File saved!');
            });

            console.log(result.data)
        })
        .catch((error) => console.error(error));
}

yargs(hideBin(process.argv))
    .command('deep-export', '', (yargs) => {
        return yargs
            .option('url', { describe: 'The url to export data from', type: 'string', demandOption: true })
            .option('jwt', { describe: 'The JWT token', type: 'string', demandOption: true })
            .option('file', { describe: 'The file to save data to', type: 'string', demandOption: false });

    }, (argv) => {
        exportData(argv.url, argv.jwt, argv.file)
            .catch((error) => console.error(error));
    })
    .demandCommand(1, 'You need at least one command before moving on')
    .help()
    .argv;
