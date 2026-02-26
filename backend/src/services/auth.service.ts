import prisma from "../config/database";
import { hashPassword, comparePasswords, isStrongPassword } from "../utils/password";
import { 
  signAccessToken, 
  signRefreshToken, 
  hashToken, 
  generateRawToken 
} from "../utils/tokens";
import { Role } from "@prisma/client";

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: Role;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
  };
  accessToken: string;
  refreshToken: string;
}

export class AuthServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthServiceError';
  }
}

// Register new user
export const registerUser = async (data: RegisterInput): Promise<LoginResponse> => {
  // Validate password strength using your function from password.ts
  if (!isStrongPassword(data.password)) {
    throw new AuthServiceError(
      'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    );
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new AuthServiceError('Email already exists');
  }

  // Hash password using your function from password.ts
  const hashedPassword = await hashPassword(data.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || Role.STUDENT,
    },
  });

  // Create email verification token using your functions from token.ts
  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);

  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });

  // Generate tokens using your functions from token.ts
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // Here you would send an email with verification link
  console.log(`📧 Verification link: ${process.env.APP_BASE_URL}/api/v1/auth/verify-email/${rawToken}`);

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
  };
};

// Login user
export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AuthServiceError('Invalid email or password');
  }

  // Check if account is locked
  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new AuthServiceError('Account is locked. Try again later.');
  }

  // Verify password using your function from password.ts
  const isValidPassword = await comparePasswords(password, user.password);

  if (!isValidPassword) {
    // Increment failed attempts
    const failedAttempts = user.failedLoginAttempts + 1;
    
    // Lock account after 5 failed attempts
    const lockUntil = failedAttempts >= 5 
      ? new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      : null;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: failedAttempts,
        lockUntil,
      },
    });

    throw new AuthServiceError('Invalid email or password');
  }

  // Reset failed attempts on successful login
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockUntil: null,
      lastLogin: new Date(),
    },
  });

  // Generate tokens using your functions from token.ts
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

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
  };
};

// Refresh tokens
export const refreshTokens = async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    // Verify refresh token using jwt directly since verify function isn't in token.ts
    const jwt = require('jsonwebtoken');
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Hash token for database lookup
    const tokenHash = hashToken(refreshToken);

    // Check if token exists and is not revoked
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        userId: payload.sub,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!storedToken) {
      throw new AuthServiceError('Invalid refresh token');
    }

    // Revoke old token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Generate new tokens
    const newAccessToken = signAccessToken(payload);
    const newRefreshToken = signRefreshToken(payload);

    // Store new refresh token
    await prisma.refreshToken.create({
      data: {
        userId: payload.sub,
        tokenHash: hashToken(newRefreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    throw new AuthServiceError('Invalid refresh token');
  }
};

// Logout user
export const logoutUser = async (refreshToken: string): Promise<void> => {
  const tokenHash = hashToken(refreshToken);

  await prisma.refreshToken.updateMany({
    where: { tokenHash },
    data: { revokedAt: new Date() },
  });
};

// Verify email
export const verifyEmail = async (token: string): Promise<void> => {
  const tokenHash = hashToken(token);

  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!verificationToken || verificationToken.expiresAt < new Date()) {
    throw new AuthServiceError('Invalid or expired verification token');
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: true },
    }),
    prisma.emailVerificationToken.delete({
      where: { id: verificationToken.id },
    }),
  ]);
};

// Resend verification email
export const resendVerification = async (email: string): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { emailVerification: true },
  });

  if (!user) {
    throw new AuthServiceError('User not found');
  }

  if (user.emailVerified) {
    throw new AuthServiceError('Email already verified');
  }

  // Delete old verification token
  if (user.emailVerification) {
    await prisma.emailVerificationToken.delete({
      where: { id: user.emailVerification.id },
    });
  }

  // Create new verification token
  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);

  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  console.log(`📧 New verification link: ${process.env.APP_BASE_URL}/api/v1/auth/verify-email/${rawToken}`);
};

// Get user by ID
export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      emailVerified: true,
      lastLogin: true,
      createdAt: true,
      student: {
        include: {
          department: true,
          specialite: true,
        },
      },
    },
  });

  if (!user) {
    throw new AuthServiceError('User not found');
  }

  return user;
};