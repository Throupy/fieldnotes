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

const workspacesDB = new PouchDB(
    `http://${process.env.COUCHDB_ADMIN_USERNAME}:${process.env.COUCHDB_ADMIN_PASSWORD}@localhost:5984/workspaces`,
    {
        auth: {
            username: process.env.COUCHDB_ADMIN_USERNAME,
            password: process.env.COUCHDB_ADMIN_PASSWORD,
        },
        skip_setup: true,
    }
);


(async () => {
    const info = await workspacesDB.info();

    if (info.error === 'not_found') {
      await fetch('http://localhost:5984/workspaces', {
        method: "PUT",
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env.COUCHDB_ADMIN_USERNAME}:${process.env.COUCHDB_ADMIN_PASSWORD}`
            ).toString("base64"),
        },
      });
    } 
  })();



export { usersDB, workspacesDB };