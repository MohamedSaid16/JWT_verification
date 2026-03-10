import prisma from "../config/database";
import { hashPassword, comparePasswords, isStrongPassword, generateRandomPassword } from "../utils/password";
import { signAccessToken, signRefreshToken } from "../utils/tokens";
import { Role } from "@prisma/client";

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: Role;
  studentId?: string;
  employeeId?: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    mustChangePassword?: boolean;
  };
  accessToken: string;
  refreshToken: string;
  requiresPasswordChange: boolean;
}

export class AuthServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthServiceError";
  }
}

const buildPayload = (user: { id: string; email: string; role: Role }) => ({
  sub: user.id,
  email: user.email,
  role: user.role,
});

const createSessionTokens = async (user: { id: string; email: string; role: Role }) => {
  const payload = buildPayload(user);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      revoked: false,
    },
  });

  return { accessToken, refreshToken };
};

export const createUserByAdmin = async (data: {
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  studentId?: string;
  employeeId?: string;
  department?: string;
  title?: string;
  createdBy?: string;
}) => {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    throw new AuthServiceError("User with this email already exists");
  }

  const tempPassword = generateRandomPassword(12);
  const hashedPassword = await hashPassword(tempPassword);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      mustChangePassword: true,
      isActive: true,
    },
  });

  if (data.role === Role.STUDENT) {
    await prisma.student.create({
      data: {
        userId: user.id,
        studentId: data.studentId || `STU${Date.now()}`,
      },
    });
  }

  if (data.role === Role.TEACHER) {
    await prisma.teacher.create({
      data: {
        userId: user.id,
        employeeId: data.employeeId || `TCH${Date.now()}`,
        department: data.department,
        title: data.title,
      },
    });
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    tempPassword,
  };
};

export const adminResetPassword = async (adminId: string, targetUserId: string): Promise<string> => {
  const admin = await prisma.user.findUnique({ where: { id: adminId } });
  if (!admin || (admin.role !== Role.ADMIN_SUPER && admin.role !== Role.ADMIN_FACULTY)) {
    throw new AuthServiceError("Unauthorized: Only admins can reset passwords");
  }

  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!targetUser) {
    throw new AuthServiceError("User not found");
  }

  const tempPassword = generateRandomPassword(12);
  const hashedPassword = await hashPassword(tempPassword);

  await prisma.user.update({
    where: { id: targetUserId },
    data: {
      password: hashedPassword,
      mustChangePassword: true,
    },
  });

  await prisma.refreshToken.updateMany({
    where: { userId: targetUserId, revoked: false },
    data: { revoked: true },
  });

  return tempPassword;
};

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { student: true, teacher: true },
  });

  if (!user || !user.isActive) {
    throw new AuthServiceError("Invalid email or password");
  }

  const isValidPassword = await comparePasswords(password, user.password);
  if (!isValidPassword) {
    throw new AuthServiceError("Invalid email or password");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  const { accessToken, refreshToken } = await createSessionTokens(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    },
    accessToken,
    refreshToken,
    requiresPasswordChange: user.mustChangePassword,
  };
};

export const changePassword = async (userId: string, currentPassword: string, newPassword: string): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AuthServiceError("User not found");
  }

  const isValid = await comparePasswords(currentPassword, user.password);
  if (!isValid) {
    throw new AuthServiceError("Current password is incorrect");
  }

  if (!isStrongPassword(newPassword)) {
    throw new AuthServiceError(
      "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character"
    );
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      mustChangePassword: false,
    },
  });

  await prisma.refreshToken.updateMany({
    where: { userId: user.id, revoked: false },
    data: { revoked: true },
  });
};

export const registerUser = async (data: RegisterInput): Promise<LoginResponse> => {
  if (!isStrongPassword(data.password)) {
    throw new AuthServiceError(
      "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character"
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    throw new AuthServiceError("Email already exists");
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || Role.STUDENT,
      mustChangePassword: false,
      isActive: true,
    },
  });

  if (user.role === Role.STUDENT) {
    await prisma.student.create({
      data: {
        userId: user.id,
        studentId: data.studentId || `STU${Date.now()}`,
      },
    });
  }

  if (user.role === Role.TEACHER) {
    await prisma.teacher.create({
      data: {
        userId: user.id,
        employeeId: data.employeeId || `TCH${Date.now()}`,
      },
    });
  }

  const { accessToken, refreshToken } = await createSessionTokens(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    accessToken,
    refreshToken,
    requiresPasswordChange: false,
  };
};

export const refreshTokens = async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
  const jwt = require("jsonwebtoken");
  const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

  const storedToken = await prisma.refreshToken.findFirst({
    where: {
      token: refreshToken,
      userId: payload.sub,
      revoked: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!storedToken) {
    throw new AuthServiceError("Invalid refresh token");
  }

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revoked: true },
  });

  const accessToken = signAccessToken(payload);
  const nextRefreshToken = signRefreshToken(payload);

  await prisma.refreshToken.create({
    data: {
      userId: payload.sub,
      token: nextRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      revoked: false,
    },
  });

  return { accessToken, refreshToken: nextRefreshToken };
};

export const logoutUser = async (refreshToken: string): Promise<void> => {
  await prisma.refreshToken.updateMany({
    where: { token: refreshToken },
    data: { revoked: true },
  });
};

export const verifyEmail = async (_token: string): Promise<void> => {
  // Email verification table is not part of the current schema.
  return;
};

export const resendVerification = async (_email: string): Promise<void> => {
  // Email verification table is not part of the current schema.
  return;
};

export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      mustChangePassword: true,
      lastLogin: true,
      createdAt: true,
      student: true,
      teacher: true,
    },
  });

  if (!user) {
    throw new AuthServiceError("User not found");
  }

  return user;
};
