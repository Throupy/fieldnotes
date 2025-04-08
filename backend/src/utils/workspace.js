import { workspacesDB } from "../config/db.js";

export const createWorkspaceDB = async (workspaceId, workspaceName, ownerUsername) => {
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
                roles: [],
            },
        };

        const securityResponse = await fetch(
            `http://localhost:5984/${workspaceId}/_security`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${Buffer.from(`${process.env.COUCHDB_ADMIN_USERNAME}:${process.env.COUCHDB_ADMIN_PASSWORD}`).toString("base64")}`,
                },
                body: JSON.stringify(securityDoc),
            }
        );

        if (!securityResponse.ok)
            throw new Error("Failed to set security settings");

        const workspaceMetadata = {
            _id: workspaceId,
            type: "workspace",
            name: workspaceName,
            icon: "📝",
            owner: ownerUsername,
            members: [ownerUsername],
            createdAt: new Date().toISOString(),
        };

        await workspacesDB.put(workspaceMetadata);

        return workspaceMetadata;
    } catch (error) {
        console.error(`Error creating workspace ${workspaceId}:`, error);
        throw error;
    }
};

export const getWorkspaceMembers = async (workspaceId) => {
    const securityUrl = `http://localhost:5984/${workspaceId}/_security`;
    const response = await fetch(securityUrl, {
        headers: {
            Authorization: `Basic ${Buffer.from(`${process.env.COUCHDB_ADMIN_USERNAME}:${process.env.COUCHDB_ADMIN_PASSWORD}`).toString("base64")}`,
        },
    });
    if (!response.ok) {
        throw new Error(
            `Failed to fetch workspace members: ${response.statusText}`
        );
    }
    const securityDoc = await response.json();
    return securityDoc.members.names || [];
};