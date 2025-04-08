import express from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import { usersDB } from "../config/db.js";
import { rateLimitMiddleware } from "../middleware/rateLimit.js";
import {
  validateEmail,
  validateUsername,
  validatePassword,
  validateFile,
} from "../utils/validate.js";
import { createWorkspaceDB } from "../utils/workspace.js";

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

router.post("/login", rateLimitMiddleware.loginLimiter, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      error: "Username and password are required",
    });
  }

  try {
    await usersDB.logIn(username, password);

    const sessionResponse = await fetch("http://localhost:5984/_session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: username, password }),
    });

    if (!sessionResponse.ok) throw new Error("Failed to get session cookie");

    const sessionData = await sessionResponse.json();
    const userDoc = await usersDB.get(`org.couchdb.user:${username}`, {
      attachments: true,
    });

    const setCookieHeader = sessionResponse.headers.get("set-cookie");
    const sessionToken = setCookieHeader?.match(/AuthSession=([^;]+)/)?.[1];
    if (!sessionToken) throw new Error("No session token in the response");

    res.cookie("AuthSession", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    let profilePicture = null;
    if (userDoc._attachments?.profilePic) {
      const { content_type, data } = userDoc._attachments.profilePic;
      profilePicture = `data:${content_type};base64,${data}`;
    }

    res.json({
      message: "Login successful",
      username,
      email: userDoc.email,
      ownedWorkspaceIds: userDoc.ownedWorkspaceIds || [],
      sharedWorkspaceIds: userDoc.sharedWorkspaceIds || [],
      profilePicture,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(401).json({ error: "Invalid credentials" });
  }
});

router.post(
  "/register",
  rateLimitMiddleware.registerLimiter,
  upload.single("profilePic"),
  async (req, res) => {
    const { email, username, password } = req.body;
    const profilePic = req.file;
    const personalWorkspaceId = `workspace_${username?.toLowerCase()}_personal`;

    if (!email || !username || !password) {
      return res
        .status(400)
        .json({ error: "Email, username, and password are required" });
    }

    try {
      const validatedEmail = validateEmail(email);
      const validatedUsername = validateUsername(username);
      const validatedPassword = validatePassword(password);
      if (profilePic) validateFile(profilePic);

      const personalWorkspace = await createWorkspaceDB(
        personalWorkspaceId,
        "Personal",
        validatedUsername
      );

      await usersDB.signUp(validatedUsername, validatedPassword, {
        metadata: {
          role: "user",
          email: validatedEmail,
          ownedWorkspaceIds: [personalWorkspace._id],
          sharedWorkspaceIds: [],
        },
      });

      const userDoc = await usersDB.get(`org.couchdb.user:${validatedUsername}`);
      if (profilePic) {
        await usersDB.putAttachment(
          `org.couchdb.user:${validatedUsername}`,
          "profilePic",
          userDoc._rev,
          profilePic.buffer,
          profilePic.mimetype
        );
      }

      res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
      console.error("Registration error:", err);
      res.status(err.message.includes("Invalid") ? 400 : 500).json({
        error: err.message.includes("Invalid")
          ? err.message
          : "Registration failed",
      });
    }
  }
);

router.get("/me", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorised" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid Token" });
    }
    res.json(user);
  });
});

export default router;
