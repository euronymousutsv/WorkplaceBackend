import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AuthenticatedRequest } from './authmiddleware';

/**
 * Role-based access control (RBAC) middleware.
 * Ensures that only users with the specified roles can access the route.
 *
 * @param roles - The required roles for the route (supports multiple).
 * @returns Express middleware function.
 */
export const authorizeRole = (requiredRoles: string | string[]): RequestHandler => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    // 1️⃣ Ensure the user is authenticated
    if (!req.user) {
      console.warn(`[AUTH] Unauthorized access attempt. No user info.`);
      res.status(401).json({ message: 'Unauthorized: No user information provided' });
      return;
    }

    // 2️⃣ Normalize role to lowercase (in case DB role values differ)
    const userRole = req.user.role?.toLowerCase();

    // 3️⃣ Check if the user's role matches any required role
    const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]; // Convert to array
    const hasAccess = rolesArray.some(role => role.toLowerCase() === userRole);

    if (!hasAccess) {
      console.warn(`[AUTH] Forbidden access by ${req.user.email} with role ${req.user.role}`);
      res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      return;
    }

    console.info(`[AUTH] Access granted to ${req.user.email} with role ${req.user.role}`);
    next(); // Proceed to the next middleware or route handler
  };
};

/**
 * ✅ Example usage in a route:
 * 
 * // Admin-only route
 * app.get('/api/admin', authenticateJWT, authorizeRole(['admin']), (req, res) => {
 *   res.json({ message: 'Welcome, Admin!' });
 * });
 * 
 * // Manager or Admin route
 * app.get('/api/management', authenticateJWT, authorizeRole(['manager', 'admin']), (req, res) => {
 *   res.json({ message: 'Welcome, Manager or Admin!' });
 * });
 */
