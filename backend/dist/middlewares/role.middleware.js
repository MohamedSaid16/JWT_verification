"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSelfOrRole = exports.requireRole = void 0;
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        if (req.user.role === "ADMIN_SUPER")
            return next();
        if (!roles.includes(req.user.role)) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
const requireSelfOrRole = (paramKey, ...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const targetId = req.params[paramKey];
        if (req.user.id === targetId)
            return next();
        if (req.user.role === "ADMIN_SUPER")
            return next();
        if (!roles.includes(req.user.role)) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }
        next();
    };
};
exports.requireSelfOrRole = requireSelfOrRole;
//# sourceMappingURL=role.middleware.js.map