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

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment varaible must be defined")
}

const SECRET_KEY = process.env.JWT_SECRET;

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

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15m
    max: 100,
    message: 'Too many requests, please try again later'
})

app.use(globalLimiter);

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
        
        return {
            workspaceId,
            ownerUsername,
            members: [ownerUsername]
        }
    } catch (error) {
        console.error(`Error creating workspace ${workspaceId}:`, error);
        throw error;
    }
};

const getWorkspaceMembers = async (workspaceId) => {
    const securityUrl = `http://localhost:5984/${workspaceId}/_security`;
    const response = await fetch(securityUrl, {
        headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.COUCHDB_ADMIN_USERNAME}:${process.env.COUCHDB_ADMIN_PASSWORD}`).toString('base64')}`
        }
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch workspace members: ${response.statusText}`);
    }
    const securityDoc = await response.json();
    return securityDoc.members.names || [];
}

app.post('/update-profile', upload.single('profilePic'), async (request, response) => {
    const authSession = request.cookies?.AuthSession;
    const { email, password, currentPassword } = request.body;
    const profilePic = request.file;

    if (!authSession) {
        return response.status(401).json({ error: 'Authentication required' });
    }

    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return response.status(400).json({ error: 'Invalid email format' });
        }
        if (email.length > 50) {
            return response.status(400).json({ error: 'Email too long' });
        }
    }

    if (password) {
        if (!currentPassword) {
            return response.status(400).json({ error: 'Current password is required to change password' });
        }
        if (password.length < 6) {
            return response.status(400).json({ error: 'Password must be at least 6 characters long' });
        }
        if (password === currentPassword) {
            return response.status(400).json({ error: 'New password must be different from current password' });
        }
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

        const userDoc = await usersDB.get(`org.couchdb.user:${username}`);

        if (password && currentPassword) {
            await usersDB.logIn(username, currentPassword);
            await usersDB.changePassword(username, password, {
                metadata: userDoc.metadata
            });
        }

        if (email) {
            userDoc.email = email
        }

        if (profilePic) {
            const updatedDoc = await usersDB.putAttachment(
                `org.couchdb.user:${username}`,
                'profilePic',
                userDoc._rev,
                profilePic.buffer,
                profilePic.mimetype
            );
            userDoc._rev = updatedDoc._rev;
        }

        if (email) {
            await usersDB.put(userDoc);
        }

        let profilePicture = null;
        const refreshedDoc = await usersDB.get(`org.couchdb.user:${username}`, { attachments: true });
        if (refreshedDoc._attachments?.profilePic) {
            const { content_type, data } = refreshedDoc._attachments.profilePic;
            profilePicture = `data:${content_type};base64,${data}`;
          } else if (profilePic) {
            profilePicture = `data:${profilePic.mimetype};base64,${profilePic.buffer.toString('base64')}`;
        }

        response.json({
            email: email || userDoc.email,
            profilePicture
        })

    } catch (error) {
        console.error('Profile update error:', error);
        if (error.message === 'Name or password is incorrect.') {
          return response.status(401).json({ error: 'Current password is incorrect' });
        }
        response.status(500).json({ error: 'Failed to update profile' });
    }
});

app.post('/register', registerLimiter, upload.single('profilePic'), async (request, response) => {
    const { email, username, password } = request.body;
    const profilePic = request.file;
    const personalWorkspaceId = `workspace_${username.toLowerCase()}_personal`;

    if (!email || !username || !password) {
        return response.status(400).json({ error: 'Email, username, and password are required' });
    }

    try {
        console.log("startin gsingup")
        const personalWorkspace = await createWorkspaceDB(personalWorkspaceId, username);
        console.log("Created personal workspace: ", personalWorkspace);

        await usersDB.signUp(username, password, {
            metadata: {
                role: 'user',
                ownedWorkspaces: [{
                    workspaceId: personalWorkspaceId,
                    ownerUsername: username,
                    members: [username],
                }],
                sharedWorkspaces: [],
                email: email
            }
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
    
        // get the members for each of the workspaces (append to response - cannot get direcly)
        const ownedWorkspaces = await Promise.all(
            (userDoc.ownedWorkspaces || []).map(async (workspace) => ({
                ...workspace,
                members: await getWorkspaceMembers(workspace.workspaceId)
            }))
        );
        const sharedWorkspaces = userDoc.sharedWorkspaces || [];

        let profilePicture = null;
        if (userDoc._attachments?.profilePic) {
            const { content_type, data } = userDoc._attachments.profilePic;
            profilePicture = `data:${content_type};base64,${data}`;
        }

        let email = userDoc.email;

        const setCookieHeader = sessionResponse.headers.get('set-cookie');
        console.log("Set cookie header: ", setCookieHeader);
        const sessionToken = setCookieHeader?.match(/AuthSession=([^;]+)/)?.[1];
        if (!sessionToken) throw new Error('No session token in the response');

        // Set CouchDB session cookie
        console.log("Returning email", email)
        response.cookie('AuthSession', sessionToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
        response.json({
            message: 'Login successful',
            username,
            email,
            ownedWorkspaces,
            sharedWorkspaces,
            profilePicture
        });
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

    if (workspaceName.length > 15) {
        return response.status(400).json({ error: 'Workspace name must be less than 15 characters' });
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
        const workspaceInfo = await createWorkspaceDB(workspaceId, username);
        
        const userDoc = await usersDB.get(`org.couchdb.user:${username}`);
        const ownedWorkspaces = userDoc.ownedWorkspaces || [];

        if (!ownedWorkspaces.some(ws => ws.workspaceId === workspaceId)) {
          userDoc.ownedWorkspaces = [...ownedWorkspaces, workspaceInfo];
          await usersDB.put(userDoc);
        }
        
        response.status(201).json({ 
            message: 'Workspace created successfully', 
            workspace: workspaceInfo
        });
    } catch (error) {
        console.error('Error creating workspace:', error);
        response.status(500).json({ error: `Failed to create workspace: ${error.message}` });
    }
});

app.post('/workspaces/invite', async (request, response) => {
    const authSession = request.cookies?.AuthSession
    const { workspaceId, inviteeUsername } = request.body;

    if (!authSession || !workspaceId || !inviteeUsername) {
        return response.status(401).json({ error: 'Missing required fields' });
    }

    try {
        // validate session
        const sessionRes = await fetch('http://localhost:5984/_session', {
            method: 'GET',
            headers: {
                'Cookie': `AuthSession=${authSession}`
            }
        });

        if (!sessionRes.ok) {
            return response.status(401).json({ error: 'Invalid session' });
        }

        const sessionData = await sessionRes.json();
        const ownerUsername = sessionData.userCtx.name;

        const ownerDoc = await usersDB.get(`org.couchdb.user:${ownerUsername}`);
        console.log(ownerDoc)
        const workspace = ownerDoc.ownedWorkspaces?.find(ws => ws.workspaceId === workspaceId);

        if (!workspace) {
            return response.status(403).json({ error: 'You do not have permission to invite users to this workspace' });
        }

        
        const securityUrl = `http://localhost:5984/${workspaceId}/_security`;

        const currentSecRes = await fetch(securityUrl, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${process.env.COUCHDB_ADMIN_USERNAME}:${process.env.COUCHDB_ADMIN_PASSWORD}`).toString('base64')}`
            }
        });
        const currentSecurity = await currentSecRes.json();

        const updatedSecurity = {
            ...currentSecurity,
            members: {
                names: Array.from(new Set([...(currentSecurity.members?.names || []), inviteeUsername])),
                roles: currentSecurity.members?.roles || []
            }
        };

        const updateSecRes = await fetch(securityUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(`${process.env.COUCHDB_ADMIN_USERNAME}:${process.env.COUCHDB_ADMIN_PASSWORD}`).toString('base64')}`
            },
            body: JSON.stringify(updatedSecurity)
        });

        if (!updateSecRes.ok) throw new Error('Failed to update workspace security');

        // update the invitee's user document to add the workspace
        const inviteeDoc = await usersDB.get(`org.couchdb.user:${inviteeUsername}`);
        console.log("Invitee doc: ", inviteeDoc)
        const sharedWorkspaces = inviteeDoc.sharedWorkspaces || [];
        const sharedWorkspaceEntry = { workspaceId, ownerUsername, members: updatedSecurity.members.names };
        if (!sharedWorkspaces.some(ws => ws.workspaceId === workspaceId)) {
            inviteeDoc.sharedWorkspaces = [...sharedWorkspaces, sharedWorkspaceEntry];
            await usersDB.put(inviteeDoc);
        }
        console.log("Updated Invitee doc: ", inviteeDoc)

        const workspaceIndex = ownerDoc.ownedWorkspaces.findIndex(ws => ws.workspaceId === workspaceId);
        ownerDoc.ownedWorkspaces[workspaceIndex] = {
            ...ownerDoc.ownedWorkspaces[workspaceIndex],
            members: updatedSecurity.members.names
          };
        await usersDB.put(ownerDoc);

        response.status(200).json({ message: 'Invite sent successfully', workspaceId });
    } catch (err) {
        console.error('Error sending invite:', err);
        response.status(500).json({ error: 'Failed to send invite' });
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

// pingpong for initial auth connection test
app.head("/ping", async (request, response) => {
    console.log("Responding pong...")
    response.sendStatus(200);
});

app.get('/session', async (request, response) => {
    const authSession = request.cookies?.AuthSession;
    if (!authSession) return response.status(401).json({ error: 'Not authenticated' });
  
    const sessionRes = await fetch('http://localhost:5984/_session', {
      method: 'GET',
      headers: { 'Cookie': `AuthSession=${authSession}` }
    });
    if (!sessionRes.ok) return response.status(401).json({ error: 'Invalid session' });
  
    const sessionData = await sessionRes.json();
    const username = sessionData.userCtx.name;
    if (!username) return response.status(401).json({ error: 'User not authenticated' });
  
    const userDoc = await usersDB.get(`org.couchdb.user:${username}`, { attachments: true });
    const ownedWorkspaces = await Promise.all(
      (userDoc.ownedWorkspaces || []).map(async (ws) => ({
        ...ws,
        members: await getWorkspaceMembers(ws.workspaceId)
      }))
    );
    const sharedWorkspaces = await Promise.all(
      (userDoc.sharedWorkspaces || []).map(async (ws) => ({
        ...ws,
        members: await getWorkspaceMembers(ws.workspaceId)
      }))
    );
    let profilePicture = null;
    if (userDoc._attachments?.profilePic) {
      const { content_type, data } = userDoc._attachments.profilePic;
      profilePicture = `data:${content_type};base64,${data}`;
    }
  
    response.json({
      username,
      email: userDoc.email,
      ownedWorkspaces,
      sharedWorkspaces,
      profilePicture
    });
  });

app.listen(port, () => console.log(`Auth server running on localhost port ${port}`))