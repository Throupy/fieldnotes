import PouchDB from "pouchdb";
import PouchAuth from "pouchdb-authentication";

PouchDB.plugin(PouchAuth); 

const pagesDB = new PouchDB("pages");

export { pagesDB };
