"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger = {
    info: (message, meta) => console.log(`[INFO] ${message}`, meta ?? ""),
    error: (message, meta) => console.error(`[ERROR] ${message}`, meta ?? ""),
    warn: (message, meta) => console.warn(`[WARN] ${message}`, meta ?? ""),
};
exports.default = logger;
//# sourceMappingURL=logger.js.map