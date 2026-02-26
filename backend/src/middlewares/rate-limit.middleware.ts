import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "Too many login attempts, try again later.",
});

export const registerLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: "Too many registrations, try again later.",
});

export const refreshLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: "Too many refresh attempts.",
});

export const globalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 1000,
  message: "Too many requests.",
});