import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { rateLimitMiddleware } from "./middleware/rateLimit.js";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import workspaceRoutes from "./routes/workspace.js";
import sessionRoutes from "./routes/session.js";

const app = express();
const port = process.env.PORT || 4000;

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable must be defined");
}

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: ["http://localhost:5173", "http://localhost:5174"],
        credentials: true,
    })
);
app.use(rateLimitMiddleware.globalLimiter);

app.use(authRoutes);
app.use(profileRoutes);
app.use(workspaceRoutes);
app.use(sessionRoutes);

app.listen(port, () =>
    console.log(`Auth server running on localhost port ${port}`)
);