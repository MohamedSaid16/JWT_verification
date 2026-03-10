import { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: Role;
        roles: string[];
        permissions: string[];
        mustChangePassword: boolean;
      };
    }
  }
}

export {};
