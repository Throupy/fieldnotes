import express from 'express';
import PouchDB from 'pouchdb';
import PouchAuth from 'pouchdb-authentication';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import multer from 'multer';

dotenv.config()
const app = express()
const port = process.env.PORT || 4000; 

const upload = multer({
    storage: multer.memoryStorage(), //passing to couchdb
    limits: {
        fileSize: 5 * 1024 * 1024 //5MB
    }
})

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));

PouchDB.plugin(PouchAuth)

console.log(process.env.COUCHDB_ADMIN_USERNAME)
console.log(process.env.COUCHDB_ADMIN_PASSWORD)

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15min
    max: 10,
    message: 'Too many login attempts, please try again later'
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1hr
    max: 5,
    message: 'Too many registration attempts, please try again later'
});

const usersDB = new PouchDB(
    `http://${process.env.COUCHDB_ADMIN_USERNAME}:${process.env.COUCHDB_ADMIN_PASSWORD}@localhost:5984/_users`, {
        auth: { username: process.env.COUCHDB_ADMIN_USERNAME, password: process.env.COUCHDB_ADMIN_PASSWORD },
        skip_setup: true
    }
);

const createWorkspaceDB = async (workspaceId, ownerUsername) => {
    // Create a new table for the workspace, done initially upon registration and then again when the user wants to create
    // another workspace. It doesn't look like PouchDB supports creation of a table through the library, so we can just make
    // a request to the CouchDB server to create a new table.
    try {
        const response = await fetch(`http://localhost:5984/${workspaceId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Basic ${Buffer.from(`${process.env.COUCHDB_ADMIN_USERNAME}:${process.env.COUCHDB_ADMIN_PASSWORD}`).toString('base64')}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (errorData.error !== 'file_exists') throw new Error(`Failed to create workspace: ${errorData.reason}`);
        }

        const securityDoc = {
            admins: { names: [process.env.COUCHDB_ADMIN_USERNAME], roles: ['_admin'] },
            members: { names: [ownerUsername], roles: [] }
        };

        const securityResponse = await fetch(`http://localhost:5984/${workspaceId}/_security`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(`${process.env.COUCHDB_ADMIN_USERNAME}:${process.env.COUCHDB_ADMIN_PASSWORD}`).toString('base64')}`
            },
            body: JSON.stringify(securityDoc)
        });

        if (!securityResponse.ok) throw new Error('Failed to set security settings');
        
        return new PouchDB(`http://localhost:5984/${workspaceId}`, { skip_setup: true });
    } catch (error) {
        console.error(`Error creating workspace ${workspaceId}:`, error);
        throw error;
    }
};

const SECRET_KEY = process.env.JWT_SECRET || 'supersecret';

app.post('/register', registerLimiter, upload.single('profilePic'), async (request, response) => {
    console.log(request.body)
    console.log(request.file)
    const { email, username, password } = request.body;
    const profilePic = request.file;
    const personalWorkspaceId = `workspace_${username.toLowerCase()}_personal`;

    if (!email || !username || !password) {
        return response.status(400).json({ error: 'Email, username, and password are required' });
    }

    try {
        console.log("startin gsingup")
        await usersDB.signUp(username, password, {
            metadata: { role: 'user', workspaces: [personalWorkspaceId] }
        })
        console.log('User registered successfully');
        const userDoc = await usersDB.get(`org.couchdb.user:${username}`);
        console.log("Got userdoc: ", userDoc);
        if (profilePic) {
            await usersDB.putAttachment(
                `org.couchdb.user:${username}`,
                'profilePic',
                userDoc._rev,
                profilePic.buffer,
                profilePic.mimetype
            )
        }
        console.log("change dpfp")

        // await createWorkspaceDB(personalWorkspaceId, username);
        response.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Registration error:', err);
        response.status(400).json({ error: `Registration failed: ${err.message}` });
    }
});

app.post('/login', loginLimiter, async (request, response) => {
    const { username, password } = request.body;

    // Will handle this on the frontend, so it should never hit.
    // better to have an additional check tho
    if (!username || !password) {
        return response.status(400).json({
            error: 'Username and password are required'
        })
    }

    try {
        await usersDB.logIn(username, password);

        const sessionResponse = await fetch('http://localhost:5984/_session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: username, password }) 
        });
        
        if (!sessionResponse.ok) throw new Error('Failed to get session cookie');
    
        const sessionData = await sessionResponse.json();
        console.log("Session data: ", sessionData);

        const userDoc = await usersDB.get(`org.couchdb.user:${username}`, { attachments: true });
        const workspaceIds = userDoc.workspaces || [];
    
        let profilePicture = null;
        if (userDoc._attachments?.profilePic) {
            const { content_type, data } = userDoc._attachments.profilePic;
            profilePicture = `data:${content_type};base64,${data}`;
        }

        const setCookieHeader = sessionResponse.headers.get('set-cookie');
        console.log("Set cookie header: ", setCookieHeader);
        const sessionToken = setCookieHeader?.match(/AuthSession=([^;]+)/)?.[1];
        if (!sessionToken) throw new Error('No session token in the response');

        // Set CouchDB session cookie
        response.cookie('AuthSession', sessionToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
        response.json({ message: 'Login successful', username, workspaceIds, profilePicture });
    } catch (err) {
        console.error('Login error:', err);
        response.status(401).json({ error: 'Invalid credentials' });
    }
});

app.post('/workspaces', async (request, response) => {
    const authSession = request.cookies?.AuthSession;
    const { workspaceName } = request.body;
    
    if (!authSession) {
        return response.status(401).json({ error: 'Authentication required' });
    }
    
    if (!workspaceName) {
        return response.status(400).json({ error: 'Workspace name is required' });
    }
    
    try {
        const sessionResponse = await fetch('http://localhost:5984/_session', {
            method: 'GET',
            headers: {
                'Cookie': `AuthSession=${authSession}`
            }
        });
        
        if (!sessionResponse.ok) {
            return response.status(401).json({ error: 'Invalid session' });
        }
        
        const sessionData = await sessionResponse.json();
        const username = sessionData.userCtx.name;
        
        if (!username) {
            return response.status(401).json({ error: 'User not authenticated' });
        }
        
        const workspaceId = `workspace_${username.toLowerCase()}_${workspaceName.toLowerCase().replace(/\s+/g, '_')}`;
        
        await createWorkspaceDB(workspaceId, username);
        
        const userDoc = await usersDB.get(`org.couchdb.user:${username}`);
        const workspaces = userDoc.workspaces || [];
        
        if (!workspaces.includes(workspaceId)) {
            userDoc.workspaces = [...workspaces, workspaceId];
            await usersDB.put(userDoc);
        }
        
        response.status(201).json({ 
            message: 'Workspace created successfully', 
            workspaceId,
            workspaceName
        });
    } catch (error) {
        console.error('Error creating workspace:', error);
        response.status(500).json({ error: `Failed to create workspace: ${error.message}` });
    }
});

// test rotue - verify token
app.get('/me', (request, response) => {
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
        return response.status(401).json({ error: 'Unauthorised' })
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return response.status(403).json({ error: 'Invalid Token'})
        }
        response.json(user);
    });
});

app.listen(port, () => console.log(`Auth server running on localhost port ${port}`))