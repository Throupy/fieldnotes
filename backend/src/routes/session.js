import express from "express";
import usersDB from "../config/db.js";
import { getWorkspaceMembers } from "../utils/workspace.js";

const router = express.Router();

router.head("/ping", async (req, res) => {
    console.log("Responding pong...");
    res.sendStatus(200);
});

router.get("/session", async (req, res) => {
    const authSession = req.cookies?.AuthSession;
    if (!authSession) {
        return res.status(401).json({ error: "Not authenticated" });
    }

    const sessionRes = await fetch("http://localhost:5984/_session", {
        method: "GET",
        headers: { Cookie: `AuthSession=${authSession}` },
    });
    if (!sessionRes.ok) {
        return res.status(401).json({ error: "Invalid session" });
    }

    const sessionData = await sessionRes.json();
    const username = sessionData.userCtx.name;
    if (!username) {
        return res.status(401).json({ error: "User not authenticated" });
    }

    const userDoc = await usersDB.get(`org.couchdb.user:${username}`, {
        attachments: true,
    });
    const ownedWorkspaces = await Promise.all(
        (userDoc.ownedWorkspaces || []).map(async (ws) => ({
            ...ws,
            members: await getWorkspaceMembers(ws.workspaceId),
        }))
    );
    const sharedWorkspaces = await Promise.all(
        (userDoc.sharedWorkspaces || []).map(async (ws) => ({
            ...ws,
            members: await getWorkspaceMembers(ws.workspaceId),
        }))
    );
    let profilePicture = null;
    if (userDoc._attachments?.profilePic) {
        const { content_type, data } = userDoc._attachments.profilePic;
        profilePicture = `data:${content_type};base64,${data}`;
    }

    res.json({
        username,
        email: userDoc.email,
        ownedWorkspaces,
        sharedWorkspaces,
        profilePicture,
    });
});

export default router;