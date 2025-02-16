import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import pool from '../config/db'; // Import database connection

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';


export interface AuthenticatedRequest extends Request {
  user?: { id: number; email: string; role: string };
}

//Middleware to authenticate JWT tokens
export const authenticateJWT = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.header('Authorization');
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Access denied, no token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string };

    // Query user from database
    const userQuery = await pool.query(
      `SELECT e."EmployeeID", e."Email", r."RoleName"
       FROM workplacedb."employee" e
       JOIN workplacedb."Role" r ON e."RoleID" = r."RoleID"
       WHERE e."EmployeeID" = $1`,
      [decoded.id]
    );
    

    if (userQuery.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const user = userQuery.rows[0];

    // Attach user to request object
    req.user = {
      id: user.EmployeeID,
      email: user.Email,
      role: user.RoleName,
    };

    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(403).json({ message: 'Invalid token' });
    if (err instanceof Error) {
      console.error('Token error:', err.message);
    } else {
      console.error('Token error:', err);
    }

  }
};

// Function: Generate JWT Token
export const generateToken = (id: number, email: string, role: string): string => {
  return jwt.sign(
    { id, email, role },
    JWT_SECRET,
    { expiresIn: '1d' } // Token expires in 1 day
  );
};

// NOTE: All database integration points are marked with TODO comments for easy replacement later.


