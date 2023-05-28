#!/usr/bin/env node
import pkg from '@apollo/client';
const {gql} = pkg;
import fs from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { stripSymbols } from 'apollo-utilities';
import moment from "moment";
let current_time = Date.now();
import axios from "axios";
import {generateApolloClient,} from "@deep-foundation/hasura/client.js";


function createApolloClient(uri) {
    const url = new URL(uri);
    let ssl;

    if (url.protocol === "https:") {
        ssl = 1;
    } else if (url.protocol === "http:") {
        ssl = 0;
    } else {
        throw new Error(`Unsupported protocol: ${url.protocol}`);
    }
    const path = url.hostname + url.pathname
    return generateApolloClient(
        {
            path,
            ssl,
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
                from_id
                id
                to_id
                type_id
                value
                file {
                    bucketId
                    createdAt
                    etag
                    id
                    isUploaded
                    mimeType
                    name
                    size
                    updatedAt
                    uploadedByLinkId
                    uploadedByUserId
                }
                number {
                    id
                    link_id
                    value
                }
                object {
                    id
                    link_id
                    value
                }
                string {
                    id
                    link_id
                    value
                }
            }
        }
        `,
    })
}
function getFiles(client) {
    return client.query({
        query: gql`
            query Files {
                files {
                    bucketId
                    createdAt
                    etag
                    id
                    isUploaded
                    link_id
                    mimeType
                    name
                    size
                    updatedAt
                    uploadedByLinkId
                    uploadedByUserId
                    link {
                        from_id
                        id
                        to_id
                        type_id
                        value
                    }
                }
            }

        `,
    })
}
async function exportData(url, jwt, filename  = `dump-${moment(current_time).format("YYYY-MM-DD-HH-mm-ss")}`) {
    const client = createApolloClient(url, jwt)
    const ssl = client.ssl;
    const path = client.path.slice(0, -4);


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
                if (item?.object === null){
                    delete item.object
                }
                if (item?.string === null){
                    delete item.string
                }
                if (item?.number === null){
                    delete item.number
                }
                if (item?.file === null){
                    delete item.file
                }
            }
            fs.mkdirSync(`${filename}`, { recursive: true }, (err) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log('Dir created.');
                }
            });
            fs.writeFileSync(`${filename}/${filename}` + ".json", JSON.stringify(links), (err) => {
                if (err) throw err;
                console.log('File saved!');
            });
        })
        .catch((error) => console.error(error));
    getFiles(client).then(
        (r) => {
            const files = r["data"]["files"]
            for (let i= 0; i < files.length; i++) {
                let savedFileName = files[i].name
                const extension = savedFileName.split('.').pop();
                const fileUrl = `${ssl ? "https://" : "http://"}${path}/file?linkId=${files[i].link_id}`;
                axios.get(fileUrl, {
                    headers: {
                        'Authorization': `Bearer ${jwt}`
                    },
                    responseType: 'stream'
                }).then(function (response) {
                    const writer = fs.createWriteStream(`${filename}/${files[i].link_id}.` + extension);
                    response.data.pipe(writer);
                    writer.on('finish', () => {
                        console.log('The file has been saved!');
                    });
                    writer.on('error', (err) => {
                        console.error('There was an error writing the file', err);
                    });
                })
                    .catch(function (error) {
                        console.log(error);
                    });
            }
        }
    )

}

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
