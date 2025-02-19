import { Router, Request, Response } from 'express';
import pool from '../config/db'; // Database connection
import { authenticateJWT } from '../middleware/authmiddleware';
import { authorizeRole } from '../middleware/roleMiddleware';
import { AuthenticatedRequest } from '../middleware/authmiddleware';

const router = Router();

/**
 * @route   GET /api/users/
 * @desc    Get all users (Admin only)
 * @access  Private (Admin)
 */
router.get('/', authenticateJWT, authorizeRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Query to fetch all users from the database
    const result = await pool.query(`
      SELECT e."EmployeeID", e."FirstName", e."LastName", e."Email", e."PhoneNumber", 
             e."EmploymentStatus", r."RoleName"
      FROM workplacedb."employee" e
      JOIN workplacedb."Role" r ON e."RoleID" = r."RoleID"
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get a single user by ID
 * @access  Private (Admin or User themselves)
 */
router.get('/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = parseInt(req.params.id);

  if (isNaN(userId)) {
     res.status(400).json({ message: 'Invalid user ID' });
     return;
  }

  // Check if the logged-in user is admin or accessing their own profile
  if (req.user?.role !== 'admin' && req.user?.id !== userId) {
    res.status(403).json({ message: 'Forbidden: Access denied' });
    return;
  }

  try {
    const result = await pool.query(`
      SELECT e."EmployeeID", e."FirstName", e."LastName", e."Email", e."PhoneNumber",
             e."EmploymentStatus", r."RoleName"
      FROM workplacedb."employee" e
      JOIN workplacedb."Role" r ON e."RoleID" = r."RoleID"
      WHERE e."EmployeeID" = $1
    `, [userId]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});

/**
 * @route   POST /api/users/
 * @desc    Create a new user (Admin only)
 * @access  Private (Admin)
 */
router.post('/', authenticateJWT, authorizeRole('admin'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { firstName, lastName, email, phoneNumber, employmentStatus, roleId, password } = req.body;
  // Temporary log to check what the backend receives
console.log("Request Body:", req.body);
if (
  [firstName, lastName, email, phoneNumber, employmentStatus, roleId, password]
    .some(field => field === undefined || field === null || field === '')
) {
  res.status(400).json({ message: 'Missing required fields' });
  return;
}
  


  try {
    // Insert new user into the database
    const result = await pool.query(`
      INSERT INTO workplacedb."employee" 
        ("FirstName", "LastName", "Email", "PhoneNumber", "EmploymentStatus", "RoleID", "Password")
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [firstName, lastName, email, phoneNumber, employmentStatus || 'Active', roleId, password]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});

/**
 * @route   PUT /api/users/:id
 * @desc    Update user details
 * @access  Private  (User themselves only)
 */
router.put('/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response):Promise<void> => {
  const userId = parseInt(req.params.id);
  const { firstName, lastName, phoneNumber, employmentStatus } = req.body;

  if (isNaN(userId)) {
    res.status(400).json({ message: 'Invalid user ID' });
    return;
  }

  // Check if user is authorized to update profile
  if (req.user?.id !== userId) {
    res.status(403).json({ message: 'Forbidden: Access denied' });
    return;
  }

  try {
    // Update user in the database
    const result = await pool.query(`
      UPDATE workplacedb."employee"
      SET "FirstName" = COALESCE($1, "FirstName"),
          "LastName" = COALESCE($2, "LastName"),
          "PhoneNumber" = COALESCE($3, "PhoneNumber"),
          "EmploymentStatus" = COALESCE($4, "EmploymentStatus")
      WHERE "EmployeeID" = $5
      RETURNING *
    `, [firstName, lastName, phoneNumber, employmentStatus, userId]);

    if (result.rows.length === 0) {
       res.status(404).json({ message: 'User not found' });
       return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user (Admin only)
 * @access  Private (Admin)
 */
router.delete('/:id', authenticateJWT, authorizeRole('admin'), async (req: AuthenticatedRequest, res: Response):Promise<void> => {
  const userId = parseInt(req.params.id);

  if (isNaN(userId)) {
     res.status(400).json({ message: 'Invalid user ID' });
     return;  
  }

  try {
    // Delete user from the database
    const result = await pool.query(`
      DELETE FROM workplacedb."employee"
      WHERE "EmployeeID" = $1
      RETURNING *
    `, [userId]);

    if (result.rows.length === 0) {
       res.status(404).json({ message: 'User not found' });
       return;
    }

    res.json({ message: 'User deleted successfully', user: result.rows[0] });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;
