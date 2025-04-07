import express from "express";
import PouchDB from "pouchdb";
import PouchAuth from "pouchdb-authentication";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import multer from "multer";
import sanitizeHtml from "sanitize-html";
import validator from "validator";

dotenv.config();
const app = express();
const port = process.env.PORT || 4000;

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment varaible must be defined");
}

const SECRET_KEY = process.env.JWT_SECRET;

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        try {
            validateFile(file);
            cb(null, true);
        } catch (err) {
            cb(err);
        }
    },
});

const sanitizeOptions = {
    allowedTags: [],
    allowedAttributes: {},
};

export const sanitizeInput = (input) => {
    if (!typeof input === "string") return input;
    return sanitizeHtml(input, sanitizeOptions);
};

export const validateEmail = (email) => {
    if (!email || typeof email !== "string") return false;
    const sanitizedEmail = sanitizeInput(email);
    const isValid = validator.isEmail(sanitizedEmail);
    if (!isValid) {
        throw new Error("Invalid email format");
    }
    if (!sanitizedEmail.length > 50) {
        throw new Error("Email too long");
    }
    return sanitizedEmail;
};

export const validateUsername = (username) => {
    const sanitizedUsername = sanitizeInput(username);
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(sanitizedUsername)) {
        throw new Error("Invalid username format");
    }
    return sanitizedUsername;
};

export const validatePassword = (password, currentPassword = null) => {
    const sanitizedPassword = sanitizeInput(password);
    if (sanitizedPassword.length < 6 || sanitizedPassword.length > 100) {
        throw new Error("Password must be between 6 and 100 characters");
    }
    if (currentPassword && sanitizedPassword === currentPassword) {
        throw new Error("New password must be different from current password");
    }
    return sanitizedPassword;
};

export const validateWorkspaceName = (workspaceName) => {
    const sanitizedName = sanitizeInput(workspaceName);
    const workspaceNameRegex = /^[a-zA-Z0-9\s-]{1,15}$/;
    if (!workspaceNameRegex.test(sanitizedName)) {
        throw new Error(
            "Workspace name must be 1-15 characters long and contain only letters, numbers, spaces, or hyphens",
        );
    }
    return sanitizedName;
};

export const validateWorkspaceId = (workspaceId) => {
    const sanitizedId = sanitizeInput(workspaceId);
    const workspaceIdRegex = /^workspace_[a-z0-9_-]+$/;
    if (!workspaceIdRegex.test(sanitizedId)) {
        throw new Error("Invalid workspace ID format");
    }
    return sanitizedId;
};

export const validateFile = (file) => {
    if (!file) return null;
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (!allowedTypes.includes(file.mimetype)) {
        throw new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed");
    }
    if (file.size > maxSize) {
        throw new Error("File size exceeds 2MB limit");
    }
    return file;
};

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: ["http://localhost:5173", "http://localhost:5174"],
        credentials: true,
    }),
);

PouchDB.plugin(PouchAuth);

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15min
    max: 10,
    message: "Too many login attempts, please try again later",
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1hr
    max: 5,
    message: "Too many registration attempts, please try again later",
});

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15m
    max: 100,
    message: "Too many requests, please try again later",
});

app.use(globalLimiter);

const usersDB = new PouchDB(
    `http://${process.env.COUCHDB_ADMIN_USERNAME}:${process.env.COUCHDB_ADMIN_PASSWORD}@localhost:5984/_users`, {
        auth: {
            username: process.env.COUCHDB_ADMIN_USERNAME,
            password: process.env.COUCHDB_ADMIN_PASSWORD,
        },
        skip_setup: true,
    },
);

const createWorkspaceDB = async (workspaceId, ownerUsername) => {
    // Create a new table for the workspace, done initially upon registration and then again when the user wants to create
    // another workspace. It doesn't look like PouchDB supports creation of a table through the library, so we can just make
    // a request to the CouchDB server to create a new table.
    try {
        const response = await fetch(`http://localhost:5984/${workspaceId}`, {
            method: "PUT",
            headers: {
                Authorization: `Basic ${Buffer.from(`${process.env.COUCHDB_ADMIN_USERNAME}:${process.env.COUCHDB_ADMIN_PASSWORD}`).toString("base64")}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (errorData.error !== "file_exists")
                throw new Error(`Failed to create workspace: ${errorData.reason}`);
        }

        const securityDoc = {
            admins: {
                names: [process.env.COUCHDB_ADMIN_USERNAME],
                roles: ["_admin"],
            },
            members: {
                names: [ownerUsername],
                roles: []
            },
        };

        const securityResponse = await fetch(
            `http://localhost:5984/${workspaceId}/_security`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${Buffer.from(`${process.env.COUCHDB_ADMIN_USERNAME}:${process.env.COUCHDB_ADMIN_PASSWORD}`).toString("base64")}`,
                },
                body: JSON.stringify(securityDoc),
            },
        );

        if (!securityResponse.ok)
            throw new Error("Failed to set security settings");

        return {
            workspaceId,
            ownerUsername,
            members: [ownerUsername],
        };
    } catch (error) {
        console.error(`Error creating workspace ${workspaceId}:`, error);
        throw error;
    }
};

const getWorkspaceMembers = async (workspaceId) => {
    const securityUrl = `http://localhost:5984/${workspaceId}/_security`;
    const response = await fetch(securityUrl, {
        headers: {
            Authorization: `Basic ${Buffer.from(`${process.env.COUCHDB_ADMIN_USERNAME}:${process.env.COUCHDB_ADMIN_PASSWORD}`).toString("base64")}`,
        },
    });
    if (!response.ok) {
        throw new Error(
            `Failed to fetch workspace members: ${response.statusText}`,
        );
    }
    const securityDoc = await response.json();
    return securityDoc.members.names || [];
};

app.post(
    "/update-profile",
    upload.single("profilePic"),
    async (request, response) => {
        const authSession = request.cookies?.AuthSession;
        const {
            email,
            password,
            currentPassword
        } = request.body;
        const profilePic = request.file;

        if (!authSession) {
            return response.status(401).json({
                error: "Authentication required"
            });
        }

        try {
            let validatedEmail = null;
            if (email) {
                validatedEmail = validateEmail(email);
            }

            let validatedPassword = null;
            if (password) {
                if (!currentPassword) {
                    throw new Error("Current password is required to change password");
                }
                validatedPassword = validatePassword(password, currentPassword);
                validatePassword(currentPassword);
            }

            if (profilePic) {
                validateFile(profilePic);
            }

            const sessionResponse = await fetch("http://localhost:5984/_session", {
                method: "GET",
                headers: {
                    Cookie: `AuthSession=${authSession}`,
                },
            });

            if (!sessionResponse.ok) {
                return response.status(401).json({
                    error: "Invalid session"
                });
            }

            const sessionData = await sessionResponse.json();
            const username = sessionData.userCtx.name;
    
            if (!username) {
                return response.status(401).json({ error: 'User not authenticated' });
            }

            const userDoc = await usersDB.get(`org.couchdb.user:${username}`);

            if (validatedPassword && currentPassword) {
                await usersDB.logIn(username, currentPassword);
                await usersDB.changePassword(username, validatedPassword, {
                    metadata: userDoc.metadata,
                });
            }

            if (validatedEmail) {
                userDoc.email = validatedEmail;
            }

            if (profilePic) {
                const updatedDoc = await usersDB.putAttachment(
                    `org.couchdb.user:${username}`,
                    "profilePic",
                    userDoc._rev,
                    profilePic.buffer,
                    profilePic.mimetype,
                );
                userDoc._rev = updatedDoc.rev;
            }

            if (validatedEmail) {
                await usersDB.put(userDoc);
            }

            let profilePicture = null;
            const refreshedDoc = await usersDB.get(`org.couchdb.user:${username}`, {
                attachments: true,
            });
            if (refreshedDoc._attachments?.profilePic) {
                const {
                    content_type,
                    data
                } = refreshedDoc._attachments.profilePic;
                profilePicture = `data:${content_type};base64,${data}`;
            } else if (profilePic) {
                profilePicture = `data:${profilePic.mimetype};base64,${profilePic.buffer.toString("base64")}`;
            }

            response.json({
                email: validatedEmail || userDoc.email,
                profilePicture,
            });
        } catch (error) {
            console.error("Profile update error:", error);
            if (error.message === "Name or password is incorrect.") {
                return response
                    .status(401)
                    .json({
                        error: "Current password is incorrect"
                    });
            }
            response.status(error.message.includes("Invalid") ? 400 : 500).json({
                error: error.message.includes("Invalid") ?
                    error.message :
                    "Failed to update profile",
            });
        }
    },
);

app.post(
    "/register",
    registerLimiter,
    upload.single("profilePic"),
    async (request, response) => {
        const {
            email,
            username,
            password
        } = request.body;
        const profilePic = request.file;
        const personalWorkspaceId = `workspace_${username.toLowerCase()}_personal`;

        if (!email || !username || !password) {
            return response
                .status(400)
                .json({
                    error: "Email, username, and password are required"
                });
        }

        try {
            // Validate inputs
            const validatedEmail = validateEmail(email);
            const validatedUsername = validateUsername(username);
            const validatedPassword = validatePassword(password);
            if (profilePic) {
                validateFile(profilePic);
            }

            if (!validatedEmail || !validatedUsername || !validatedPassword) {
                throw new Error("All fields are required");
            }

            const personalWorkspace = await createWorkspaceDB(
                personalWorkspaceId,
                validatedUsername,
            );

            await usersDB.signUp(validatedUsername, validatedPassword, {
                metadata: {
                    role: "user",
                    ownedWorkspaces: [{
                        workspaceId: personalWorkspaceId,
                        ownerUsername: validatedUsername,
                        members: [validatedUsername],
                    }, ],
                    sharedWorkspaces: [],
                    email: validatedEmail,
                },
            });

            const userDoc = await usersDB.get(
                `org.couchdb.user:${validatedUsername}`,
            );
            if (profilePic) {
                await usersDB.putAttachment(
                    `org.couchdb.user:${validatedUsername}`,
                    "profilePic",
                    userDoc._rev,
                    profilePic.buffer,
                    profilePic.mimetype,
                );
            }

            response.status(201).json({
                message: "User registered successfully"
            });
        } catch (err) {
            console.error("Registration error:", err);
            response.status(err.message.includes("Invalid") ? 400 : 400).json({
                error: err.message.includes("Invalid") ?
                    err.message :
                    "Registration failed",
            });
        }
    },
);

app.post("/login", loginLimiter, async (request, response) => {
    const {
        username,
        password
    } = request.body;

    // Will handle this on the frontend, so it should never hit.
    // better to have an additional check tho
    if (!username || !password) {
        return response.status(400).json({
            error: "Username and password are required",
        });
    }

    try {
        await usersDB.logIn(username, password);

        const sessionResponse = await fetch("http://localhost:5984/_session", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: username,
                password
            }),
        });

        if (!sessionResponse.ok) throw new Error("Failed to get session cookie");

        const sessionData = await sessionResponse.json();
        console.log("Session data: ", sessionData);

        const userDoc = await usersDB.get(`org.couchdb.user:${username}`, {
            attachments: true,
        });

        // get the members for each of the workspaces (append to response - cannot get direcly)
        const ownedWorkspaces = await Promise.all(
            (userDoc.ownedWorkspaces || []).map(async (workspace) => ({
                ...workspace,
                members: await getWorkspaceMembers(workspace.workspaceId),
            })),
        );
        const sharedWorkspaces = userDoc.sharedWorkspaces || [];

        let profilePicture = null;
        if (userDoc._attachments?.profilePic) {
            const {
                content_type,
                data
            } = userDoc._attachments.profilePic;
            profilePicture = `data:${content_type};base64,${data}`;
        }

        let email = userDoc.email;

        const setCookieHeader = sessionResponse.headers.get("set-cookie");
        console.log("Set cookie header: ", setCookieHeader);
        const sessionToken = setCookieHeader?.match(/AuthSession=([^;]+)/)?.[1];
        if (!sessionToken) throw new Error("No session token in the response");

        // Set CouchDB session cookie
        console.log("Returning email", email);
        response.cookie("AuthSession", sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });
        response.json({
            message: "Login successful",
            username,
            email,
            ownedWorkspaces,
            sharedWorkspaces,
            profilePicture,
        });
    } catch (err) {
        console.error("Login error:", err);
        response.status(401).json({
            error: "Invalid credentials"
        });
    }
});

app.post("/workspaces", async (request, response) => {
    const authSession = request.cookies?.AuthSession;
    const {
        workspaceName
    } = request.body;

    if (!authSession) {
        return response.status(401).json({
            error: "Authentication required"
        });
    }

    try {
        const validatedWorkspaceName = validateWorkspaceName(workspaceName);
        if (!validatedWorkspaceName) {
            throw new Error("Workspace name is required");
        }

        const sessionResponse = await fetch("http://localhost:5984/_session", {
            method: "GET",
            headers: {
                Cookie: `AuthSession=${authSession}`,
            },
        });

        if (!sessionResponse.ok) {
            return response.status(401).json({
                error: "Invalid session"
            });
        }

        const sessionData = await sessionResponse.json();
        const username = sessionData.userCtx.name;

        if (!username) {
            return response.status(401).json({
                error: "User not authenticated"
            });
        }

        const workspaceId = `workspace_${username.toLowerCase()}_${validatedWorkspaceName.toLowerCase().replace(/\s+/g, "_")}`;
        const workspaceInfo = await createWorkspaceDB(workspaceId, username);

        const userDoc = await usersDB.get(`org.couchdb.user:${username}`);
        const ownedWorkspaces = userDoc.ownedWorkspaces || [];

        if (!ownedWorkspaces.some((ws) => ws.workspaceId === workspaceId)) {
            userDoc.ownedWorkspaces = [...ownedWorkspaces, workspaceInfo];
            await usersDB.put(userDoc);
        }

        response.status(201).json({
            message: "Workspace created successfully",
            workspace: workspaceInfo,
        });
    } catch (error) {
        console.error("Error creating workspace:", error);
        response.status(error.message.includes("Invalid") ? 400 : 500).json({
            error: error.message.includes("Invalid") ?
                error.message :
                "Failed to create workspace",
        });
    }
});

app.post("/workspaces/invite", async (request, response) => {
    const authSession = request.cookies?.AuthSession;
    const {
        workspaceId,
        inviteeUsername
    } = request.body;

    try {
        // Validate inputs
        if (!authSession) {
            throw new Error("Authentication required");
        }
        const validatedWorkspaceId = validateWorkspaceId(workspaceId);
        const validatedInviteeUsername = validateUsername(inviteeUsername);

        if (!validatedWorkspaceId || !validatedInviteeUsername) {
            throw new Error("Workspace ID and invitee username are required");
        }

        const sessionRes = await fetch("http://localhost:5984/_session", {
            method: "GET",
            headers: {
                Cookie: `AuthSession=${authSession}`,
            },
        });

        if (!sessionRes.ok) {
            throw new Error("Invalid session");
        }

        const sessionData = await sessionRes.json();
        const ownerUsername = sessionData.userCtx.name;

        const ownerDoc = await usersDB.get(`org.couchdb.user:${ownerUsername}`);
        const workspace = ownerDoc.ownedWorkspaces?.find(
            (ws) => ws.workspaceId === validatedWorkspaceId,
        );

        if (!workspace) {
            throw new Error(
                "You do not have permission to invite users to this workspace",
            );
        }

        const securityUrl = `http://localhost:5984/${validatedWorkspaceId}/_security`;
        const currentSecRes = await fetch(securityUrl, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${process.env.COUCHDB_ADMIN_USERNAME}:${process.env.COUCHDB_ADMIN_PASSWORD}`).toString("base64")}`,
            },
        });
        const currentSecurity = await currentSecRes.json();

        const updatedSecurity = {
            ...currentSecurity,
            members: {
                names: Array.from(
                    new Set([
                        ...(currentSecurity.members?.names || []),
                        validatedInviteeUsername,
                    ]),
                ),
                roles: currentSecurity.members?.roles || [],
            },
        };

        const updateSecRes = await fetch(securityUrl, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${Buffer.from(`${process.env.COUCHDB_ADMIN_USERNAME}:${process.env.COUCHDB_ADMIN_PASSWORD}`).toString("base64")}`,
            },
            body: JSON.stringify(updatedSecurity),
        });

        if (!updateSecRes.ok)
            throw new Error("Failed to update workspace security");

        const inviteeDoc = await usersDB.get(
            `org.couchdb.user:${validatedInviteeUsername}`,
        );
        const sharedWorkspaces = inviteeDoc.sharedWorkspaces || [];
        const sharedWorkspaceEntry = {
            workspaceId: validatedWorkspaceId,
            ownerUsername,
            members: updatedSecurity.members.names,
        };
        if (
            !sharedWorkspaces.some((ws) => ws.workspaceId === validatedWorkspaceId)
        ) {
            inviteeDoc.sharedWorkspaces = [...sharedWorkspaces, sharedWorkspaceEntry];
            await usersDB.put(inviteeDoc);
        }

        const workspaceIndex = ownerDoc.ownedWorkspaces.findIndex(
            (ws) => ws.workspaceId === validatedWorkspaceId,
        );
        ownerDoc.ownedWorkspaces[workspaceIndex] = {
            ...ownerDoc.ownedWorkspaces[workspaceIndex],
            members: updatedSecurity.members.names,
        };
        await usersDB.put(ownerDoc);

        response
            .status(200)
            .json({
                message: "Invite sent successfully",
                workspaceId: validatedWorkspaceId,
            });
    } catch (err) {
        console.error("Error sending invite:", err);
        response.status(err.message.includes("Invalid") ? 400 : 500).json({
            error: err.message.includes("Invalid") ?
                err.message :
                "Failed to send invite",
        });
    }
});

// test rotue - verify token
app.get("/me", (request, response) => {
    const token = request.headers.authorization?.split(" ")[1];

    if (!token) {
        return response.status(401).json({
            error: "Unauthorised"
        });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return response.status(403).json({
                error: "Invalid Token"
            });
        }
        response.json(user);
    });
});

// pingpong for initial auth connection test
app.head("/ping", async (request, response) => {
    console.log("Responding pong...");
    response.sendStatus(200);
});

app.get("/session", async (request, response) => {
    const authSession = request.cookies?.AuthSession;
    if (!authSession)
        return response.status(401).json({
            error: "Not authenticated"
        });

    const sessionRes = await fetch("http://localhost:5984/_session", {
        method: "GET",
        headers: {
            Cookie: `AuthSession=${authSession}`
        },
    });
    if (!sessionRes.ok)
        return response.status(401).json({
            error: "Invalid session"
        });

    const sessionData = await sessionRes.json();
    const username = sessionData.userCtx.name;
    if (!username)
        return response.status(401).json({
            error: "User not authenticated"
        });

    const userDoc = await usersDB.get(`org.couchdb.user:${username}`, {
        attachments: true,
    });
    const ownedWorkspaces = await Promise.all(
        (userDoc.ownedWorkspaces || []).map(async (ws) => ({
            ...ws,
            members: await getWorkspaceMembers(ws.workspaceId),
        })),
    );
    const sharedWorkspaces = await Promise.all(
        (userDoc.sharedWorkspaces || []).map(async (ws) => ({
            ...ws,
            members: await getWorkspaceMembers(ws.workspaceId),
        })),
    );
    let profilePicture = null;
    if (userDoc._attachments?.profilePic) {
        const {
            content_type,
            data
        } = userDoc._attachments.profilePic;
        profilePicture = `data:${content_type};base64,${data}`;
    }

    response.json({
        username,
        email: userDoc.email,
        ownedWorkspaces,
        sharedWorkspaces,
        profilePicture,
    });
});

app.listen(port, () =>
    console.log(`Auth server running on localhost port ${port}`),
);