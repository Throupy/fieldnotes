import express from "express";
import { usersDB, workspacesDB } from "../config/db.js";
import {
  validateWorkspaceName,
  validateWorkspaceId,
  validateUsername,
} from "../utils/validate.js";
import { createWorkspaceDB } from "../utils/workspace.js";

const router = express.Router();

router.post("/workspaces", async (req, res) => {
  const authSession = req.cookies?.AuthSession;
  const { workspaceName } = req.body;

  if (!authSession) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const validatedWorkspaceName = validateWorkspaceName(workspaceName);
    if (!validatedWorkspaceName) throw new Error("Workspace name is required");

    const sessionResponse = await fetch("http://localhost:5984/_session", {
      method: "GET",
      headers: { Cookie: `AuthSession=${authSession}` },
    });

    if (!sessionResponse.ok)
      return res.status(401).json({ error: "Invalid session" });

    const sessionData = await sessionResponse.json();
    const username = sessionData.userCtx.name;
    if (!username)
      return res.status(401).json({ error: "User not authenticated" });

    const workspaceId = `workspace_${username.toLowerCase()}_${validatedWorkspaceName.toLowerCase().replace(/\s+/g, "_")}`;
    const workspaceDoc = await createWorkspaceDB(
      workspaceId,
      validatedWorkspaceName,
      username,
    );

    const userDoc = await usersDB.get(`org.couchdb.user:${username}`);
    userDoc.ownedWorkspaceIds = [
      ...(userDoc.ownedWorkspaceIds || []),
      workspaceId,
    ];
    await usersDB.put(userDoc);

    res
      .status(201)
      .json({
        message: "Workspace created successfully",
        workspace: workspaceDoc,
      });
  } catch (error) {
    console.error("Error creating workspace:", error);
    res.status(error.message.includes("Invalid") ? 400 : 500).json({
      error: error.message.includes("Invalid")
        ? error.message
        : "Failed to create workspace",
    });
  }
});

router.post("/workspaces/invite", async (req, res) => {
  const authSession = req.cookies?.AuthSession;
  const { workspaceId, inviteeUsername } = req.body;

  try {
    if (!authSession) throw new Error("Authentication required");

    const validatedWorkspaceId = validateWorkspaceId(workspaceId);
    const validatedInviteeUsername = validateUsername(inviteeUsername);
    if (!validatedWorkspaceId || !validatedInviteeUsername) {
      throw new Error("Workspace ID and invitee username are required");
    }

    const sessionRes = await fetch("http://localhost:5984/_session", {
      method: "GET",
      headers: { Cookie: `AuthSession=${authSession}` },
    });

    if (!sessionRes.ok) throw new Error("Invalid session");

    const sessionData = await sessionRes.json();
    const ownerUsername = sessionData.userCtx.name;

    const workspaceDoc = await workspacesDB.get(validatedWorkspaceId);
    if (workspaceDoc.owner !== ownerUsername) {
      throw new Error(
        "You do not have permission to invite users to this workspace",
      );
    }

    // Update DB security
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

    // Add workspace ID to invitee's shared list
    const inviteeDoc = await usersDB.get(
      `org.couchdb.user:${validatedInviteeUsername}`,
    );
    inviteeDoc.sharedWorkspaceIds = [
      ...(inviteeDoc.sharedWorkspaceIds || []),
      validatedWorkspaceId,
    ];
    await usersDB.put(inviteeDoc);

    // Update centralized workspace metadata
    workspaceDoc.members = Array.from(
      new Set([...(workspaceDoc.members || []), validatedInviteeUsername]),
    );
    await workspacesDB.put(workspaceDoc);

    res.status(200).json({
      message: "Invite sent successfully",
      workspaceId: validatedWorkspaceId,
    });
  } catch (err) {
    console.error("Error sending invite:", err);
    res.status(err.message.includes("Invalid") ? 400 : 500).json({
      error: err.message.includes("Invalid")
        ? err.message
        : "Failed to send invite",
    });
  }
});

router.get("/workspaces/:id", async (req, res) => {
    try {
      const doc = await workspacesDB.get(req.params.id);
      res.json({
        workspaceId: doc._id,
        name: doc.name,
        icon: doc.icon,
        members: doc.members,
        ownerUsername: doc.owner,
      });
    } catch (err) {
      res.status(404).json({ error: "Workspace not found" });
    }
  });

export default router;
