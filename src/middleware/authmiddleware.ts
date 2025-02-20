import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret';

export interface AuthenticatedRequest extends Request {
  user?: { EmployeeID: number; Email: string; RoleID: number }; // Add fields from the JWT
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authorization denied. Missing or malformed token.' });
    return
  }

  const token = authHeader.split(' ')[1]; // Get the token part from the Bearer header

  if (!token) {
    res.status(401).json({ error: 'Authorization denied. Missing token.' });
    return
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { EmployeeID: number; Email: string; RoleID: number };

    // Attach decoded user data to the request object
    req.user = {
      EmployeeID: decoded.EmployeeID,
      Email: decoded.Email,
      RoleID: decoded.RoleID
    };

    next(); // Continue to the next middleware or route handler
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
    return
  }
};
