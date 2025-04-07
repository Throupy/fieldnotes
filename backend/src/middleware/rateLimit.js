import rateLimit from "express-rate-limit";

export const rateLimitMiddleware = {
    loginLimiter: rateLimit({
        windowMs: 15 * 60 * 1000, // 15min
        max: 10,
        message: "Too many login attempts, please try again later",
    }),
    registerLimiter: rateLimit({
        windowMs: 60 * 60 * 1000, // 1hr
        max: 5,
        message: "Too many registration attempts, please try again later",
    }),
    globalLimiter: rateLimit({
        windowMs: 15 * 60 * 1000, // 15m
        max: 100,
        message: "Too many requests, please try again later",
    }),
};