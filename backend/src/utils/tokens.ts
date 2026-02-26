import jwt, { SignOptions, Secret } from "jsonwebtoken";
import crypto from "crypto";
import type { StringValue } from "ms";
import {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL,
} from "../config/auth";

const accessSecret: Secret = JWT_ACCESS_SECRET as Secret;
const refreshSecret: Secret = JWT_REFRESH_SECRET as Secret;

const accessOptions: SignOptions = {
  expiresIn: ACCESS_TOKEN_TTL as StringValue,
};

const refreshOptions: SignOptions = {
  expiresIn: REFRESH_TOKEN_TTL as StringValue,
};

// توقيع access token
export const signAccessToken = (payload: object) =>
  jwt.sign(payload, accessSecret, accessOptions);

// توقيع refresh token
export const signRefreshToken = (payload: object) =>
  jwt.sign(payload, refreshSecret, refreshOptions);

// تشفير التوكن للتخزين في قاعدة البيانات
export const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

// توليد توكن عشوائي (للتحقق من البريد الإلكتروني)
export const generateRawToken = () => crypto.randomBytes(48).toString("hex");