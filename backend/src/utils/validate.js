import sanitizeHtml from "sanitize-html";
import validator from "validator";

const sanitizeOptions = {
    allowedTags: [],
    allowedAttributes: {},
};

export const sanitizeInput = (input) => {
    if (typeof input !== "string") return input;
    return sanitizeHtml(input, sanitizeOptions).trim();
};

export const validateEmail = (email) => {
    const sanitizedEmail = sanitizeInput(email);
    const isValid = validator.isEmail(sanitizedEmail);
    if (!isValid) {
        throw new Error("Invalid email format");
    }
    if (sanitizedEmail.length > 50) {
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
            "Workspace name must be 1-15 characters long and contain only letters, numbers, spaces, or hyphens"
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