"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSecurityAlert = exports.sendVerificationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const transporter = nodemailer_1.default.createTransport({
    host: (0, env_1.getEnv)("SMTP_HOST"),
    port: Number((0, env_1.getEnv)("SMTP_PORT")),
    secure: false,
    auth: {
        user: (0, env_1.getEnv)("SMTP_USER"),
        pass: (0, env_1.getEnv)("SMTP_PASS"),
    },
});
const sendVerificationEmail = async (to, link) => {
    await transporter.sendMail({
        from: `"University Platform" <${(0, env_1.getEnv)("SMTP_USER")}>`,
        to,
        subject: "Verify your email",
        html: `<p>Please verify your email:</p><a href="${link}">${link}</a>`,
    });
};
exports.sendVerificationEmail = sendVerificationEmail;
const sendSecurityAlert = async (to) => {
    await transporter.sendMail({
        from: `"University Platform" <${(0, env_1.getEnv)("SMTP_USER")}>`,
        to,
        subject: "Security alert",
        html: `<p>Someone tried to access your account. If this wasn't you, please reset your password.</p>`,
    });
};
exports.sendSecurityAlert = sendSecurityAlert;
//# sourceMappingURL=email.service.js.map