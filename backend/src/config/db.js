import PouchDB from "pouchdb";
import PouchAuth from "pouchdb-authentication";

PouchDB.plugin(PouchAuth);

console.log("Connecting to CouchDB...");
console.log(process.env.COUCHDB_ADMIN_USERNAME);

const usersDB = new PouchDB(
    `http://${process.env.COUCHDB_ADMIN_USERNAME}:${process.env.COUCHDB_ADMIN_PASSWORD}@localhost:5984/_users`,
    {
        auth: {
            username: process.env.COUCHDB_ADMIN_USERNAME,
            password: process.env.COUCHDB_ADMIN_PASSWORD,
        },
        skip_setup: true,
    }
);

export default usersDB;