import express from "express";
import multer from "multer";
import { usersDB } from "../config/db.js";
import {
    validateEmail,
    validatePassword,
    validateFile,
} from "../utils/validate.js";

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        try {
            validateFile(file);
            cb(null, true);
        } catch (err) {
            cb(err);
        }
    },
});

router.post("/update-profile", upload.single("profilePic"), async (req, res) => {
    const authSession = req.cookies?.AuthSession;
    const { email, password, currentPassword } = req.body;
    const profilePic = req.file;

    if (!authSession) {
        return res.status(401).json({ error: "Authentication required" });
    }

    try {
        let validatedEmail = null;
        if (email) validatedEmail = validateEmail(email);

        let validatedPassword = null;
        if (password) {
            if (!currentPassword) {
                throw new Error("Current password is required to change password");
            }
            validatedPassword = validatePassword(password, currentPassword);
            validatePassword(currentPassword);
        }

        if (profilePic) validateFile(profilePic);

        const sessionResponse = await fetch("http://localhost:5984/_session", {
            method: "GET",
            headers: { Cookie: `AuthSession=${authSession}` },
        });

        if (!sessionResponse.ok) {
            return res.status(401).json({ error: "Invalid session" });
        }

        const sessionData = await sessionResponse.json();
        const username = sessionData.userCtx.name;

        if (!username) {
            return res.status(401).json({ error: "User not authenticated" });
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
                profilePic.mimetype
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
            const { content_type, data } = refreshedDoc._attachments.profilePic;
            profilePicture = `data:${content_type};base64,${data}`;
        } else if (profilePic) {
            profilePicture = `data:${profilePic.mimetype};base64,${profilePic.buffer.toString("base64")}`;
        }

        res.json({
            email: validatedEmail || userDoc.email,
            profilePicture,
        });
    } catch (error) {
        console.error("Profile update error:", error);
        if (error.message === "Name or password is incorrect.") {
            return res.status(401).json({ error: "Current password is incorrect" });
        }
        res.status(error.message.includes("Invalid") ? 400 : 500).json({
            error: error.message.includes("Invalid")
                ? error.message
                : "Failed to update profile",
        });
    }
});

export default router;