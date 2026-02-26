import nodemailer from "nodemailer";
import { getEnv } from "../config/env";

const transporter = nodemailer.createTransport({
  host: getEnv("SMTP_HOST"),
  port: Number(getEnv("SMTP_PORT")),
  secure: false,
  auth: {
    user: getEnv("SMTP_USER"),
    pass: getEnv("SMTP_PASS"),
  },
});

export const sendVerificationEmail = async (to: string, link: string) => {
  await transporter.sendMail({
    from: `"University Platform" <${getEnv("SMTP_USER")}>`,
    to,
    subject: "Verify your email",
    html: `<p>Please verify your email:</p><a href="${link}">${link}</a>`,
  });
};

export const sendSecurityAlert = async (to: string) => {
  await transporter.sendMail({
    from: `"University Platform" <${getEnv("SMTP_USER")}>`,
    to,
    subject: "Security alert",
    html: `<p>Someone tried to access your account. If this wasn't you, please reset your password.</p>`,
  });
};