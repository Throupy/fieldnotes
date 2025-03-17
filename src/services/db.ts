import PouchDB from 'pouchdb';
import PouchAuth from 'pouchdb-authentication';

PouchDB.plugin(PouchAuth);

let currentWorkspaceId: string | null = null;
let pagesDB: PouchDB.Database | null = null;
let syncHandler: PouchDB.Replication.Sync<{}> | null = null;

export const setWorkspace = async (workspaceId: string) => {
    currentWorkspaceId = workspaceId;

    // Local database name with _local suffix - for ofline storage to be replicated
    const localDbName = `workspace_${workspaceId}_local`;
    pagesDB = new PouchDB(localDbName);
    console.log('Local DB name:', localDbName);

    // remote DB URI pointing to couchdb
    const remoteDbName = workspaceId;
    const remoteUrl = `http://localhost:5984/${remoteDbName}`;
    console.log('Remote URL:', remoteUrl);

    // cancel any existing sync handler (prevent conflcits)
    if (syncHandler) {
        console.log('Canceling existing sync handler');
        syncHandler.cancel();
    }

    // don't need to override fetch here... took me 2hours to debug this
    const remoteDB = new PouchDB(remoteUrl);

    try {
        console.log('Starting sync...');
        syncHandler = pagesDB.sync(remoteDB, { live: true, retry: true })
            .on('change', info => console.log('Sync change:', info))
            .on('error', err => console.error('Sync error:', err))
            .on('paused', msg => console.log('Sync paused:', msg))
            .on('active', () => console.log('Sync active'));
    } catch (err) {
        console.error('Sync setup failed:', err);
    }
};

export const getPagesDB = () => {
    if (!pagesDB) throw new Error('Workspace not set');
    return pagesDB;
};