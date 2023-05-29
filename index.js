import {generateApolloClient} from "@deep-foundation/hasura/client.js";
import {stripSymbols} from "apollo-utilities";
import pkg from '@apollo/client';
const {gql} = pkg;
import moment from "moment/moment.js";
import fs from "fs";
import axios from "axios";

export function createApolloClient(uri) {
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
export async function getMigrationsEndId(client) {
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
export async function getLinksGreaterThanId(client, id) {
    let result = await client.query({
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
                    value
                }
                object {
                    value
                }
                string {
                    value
                }
            }
        }
        `,
    })
    let links = stripSymbols(result).data.links.slice()
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
    return links
}
export async function getFiles(client) {
    let files = await client.query({
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
    return files["data"]["files"]
}
export async function exportData(url, jwt, filename  = `dump-${moment(Date.now()).format("YYYY-MM-DD-HH-mm-ss")}`) {
    const client = createApolloClient(url, jwt)
    const ssl = client.ssl;
    const path = client.path.slice(0, -4);

    const links = await getLinksGreaterThanId(client, await getMigrationsEndId(client))
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
    const files = await getFiles(client)
    for (let i = 0; i < files.length; i++) {
        let savedFileName = files[i].name
        const extension = savedFileName.split('.').pop();
        const fileUrl = `${ssl ? "https://" : "http://"}${path}/file?linkId=${files[i].link_id}`;
        try {
            const response = await axios.get(fileUrl, {
                headers: {
                    'Authorization': `Bearer ${jwt}`
                },
                responseType: 'stream'
            });
            const writer = fs.createWriteStream(`${filename}/${file.link_id}.${extension}`);
            response.data.pipe(writer);

            writer.on('finish', () => {
                console.log('The file has been saved!');
            });
            writer.on('error', (err) => {
                console.error('There was an error writing the file', err);
            });
        } catch (error) {
            console.log(error);
        }
    }
}