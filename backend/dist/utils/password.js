"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomPassword = exports.comparePasswords = exports.hashPassword = exports.isStrongPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10');
// دالة التحقق من قوة كلمة المرور
const isStrongPassword = (password) => {
    const length = password.length >= 8;
    const upper = /[A-Z]/.test(password);
    const lower = /[a-z]/.test(password);
    const number = /\d/.test(password);
    const special = /[^A-Za-z0-9]/.test(password);
    return length && upper && lower && number && special;
};
exports.isStrongPassword = isStrongPassword;
// تشفير كلمة المرور
const hashPassword = async (password) => {
    return bcryptjs_1.default.hash(password, SALT_ROUNDS);
};
exports.hashPassword = hashPassword;
// مقارنة كلمة المرور
const comparePasswords = async (password, hashedPassword) => {
    return bcryptjs_1.default.compare(password, hashedPassword);
};
exports.comparePasswords = comparePasswords;
// توليد كلمة مرور عشوائية قوية
const generateRandomPassword = (length = 10) => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*';
    const allChars = uppercase + lowercase + numbers + special;
    let password = '';
    // ضمان وجود حرف كبير، صغير، رقم، ورمز خاص
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    // إكمال الطول المطلوب
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    // خلط الأحرف
    return password.split('').sort(() => 0.5 - Math.random()).join('');
};
exports.generateRandomPassword = generateRandomPassword;
//# sourceMappingURL=password.js.map