import { Router, Request, Response } from 'express';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/authmiddleware';
import { authorizeRole } from '../middleware/roleMiddleware';

const router = Router();

/**
 * 1️.Protected Route: Get All Users (Admin only)
 * - Requires `authenticateJWT` (valid token)
 * - Requires `authorizeRole(['admin'])`
 */
router.get('/', 
  authenticateJWT, 
  authorizeRole(['admin']), 
  (req: AuthenticatedRequest, res: Response) => {
    console.log(`[ROUTE] Admin ${req.user?.email} accessed all users`);
    res.json({ message: "Here are all users. Admin access only." });
  }
);

/**
 * 2️. Protected Route: Get User Profile (Any Authenticated User)
 * - Requires `authenticateJWT`
 * - User-specific content
 */
router.get('/profile', 
  authenticateJWT, 
  (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized: No user information' });
      return;
    }

    console.log(`[ROUTE] User ${req.user.email} accessed their profile`);
    res.json({ 
      message: `Hello ${req.user.email}, this is your profile.`,
      user: req.user
    });
  }
);

/**
 * 3️. Manager-Only Access Route
 * - Managers can manage employees (view/edit)
 * - Admins also allowed (using `authorizeRole(['manager', 'admin'])`)
 */
router.get('/manage', 
  authenticateJWT, 
  authorizeRole(['manager', 'admin']), 
  (req: AuthenticatedRequest, res: Response) => {
    console.log(`[ROUTE] Manager/Admin ${req.user?.email} accessed manage route`);
    res.json({ message: "Welcome, Manager! Here you can manage employees." });
  }
);

export default router;
