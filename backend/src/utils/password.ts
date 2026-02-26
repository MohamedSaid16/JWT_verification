import bcrypt from 'bcryptjs';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10');

// دالة التحقق من قوة كلمة المرور
export const isStrongPassword = (password: string): boolean => {
  const length = password.length >= 8;
  const upper = /[A-Z]/.test(password);
  const lower = /[a-z]/.test(password);
  const number = /\d/.test(password);
  const special = /[^A-Za-z0-9]/.test(password);

  return length && upper && lower && number && special;
};

// تشفير كلمة المرور
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

// مقارنة كلمة المرور
export const comparePasswords = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};