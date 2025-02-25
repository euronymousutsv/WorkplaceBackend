"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret';
const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Authorization denied. Missing or malformed token.' });
        return;
    }
    const token = authHeader.split(' ')[1]; // Get the token part from the Bearer header
    if (!token) {
        res.status(401).json({ error: 'Authorization denied. Missing token.' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Attach decoded user data to the request object
        req.user = {
            EmployeeID: decoded.EmployeeID,
            Email: decoded.Email,
            RoleID: decoded.RoleID
        };
        next(); // Continue to the next middleware or route handler
    }
    catch (error) {
        res.status(401).json({ error: 'Token is not valid' });
        return;
    }
};
exports.authMiddleware = authMiddleware;
