import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
// import { generateToken } from '../middleware/authmiddleware';
import pool from "../config/db";
import {
  loginUser,
  registerUser,
  validateVerificationCode,
  verificationCode,
} from "../controllers/authController";

const router = express.Router();
// Test route to verify registration
router.get("/", (req: Request, res: Response) => {
  console.log("Login route accessed");
  res.send("Login route is working");
});

// Login route
// Login route using database query
// router.post("/login", async (req: Request, res: Response): Promise<void> => {
//   const { email, password } = req.body;
//   console.log("Request Body:", req.body);

//   // try {
//   //   // Fetch user from the database
//   //   const userQuery = await pool.query(
//   //     'SELECT * FROM workplacedb."employee" WHERE "Email" = $1',
//   //     [email]
//   //   );
//   //   console.log('Database Query Result:', userQuery.rows);

//   //   if (userQuery.rows.length === 0) {
//   //     console.log('No user found for email:', email);
//   //     res.status(404).json({ message: 'User not found' });
//   //     return;
//   //   }

//   //   const user = userQuery.rows[0];
//   //   console.log('User from Database:', user);

//   //   // Check if the password matches
//   //   console.log('Entered Password:', password);
//   //   console.log('Stored Hashed Password:', user.password);
//   //   const isMatch = await bcrypt.compare(password, user.Password);
//   //   console.log('Password Match Result:', isMatch);

//   //   if (!isMatch) {
//   //     res.status(401).json({ message: 'Invalid credentials' });
//   //     return;
//   //   }

//   //   // Generate a JWT token
//   //   const token = generateToken(user.EmployeeID, user.Email, user.RoleID);
//   //   res.status(200).json({ token });
//   // } catch (error) {
//   //   console.error('Error during login:', error);
//   //   res.status(500).json({ message: 'Server error', error });
//   // }
// });

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/sendVerificationCode").post(verificationCode);
router.route("/validateVerificationCode").post(validateVerificationCode);
// router.route("/refreshToken").post(refreshToken);

export default router;

// NOTE: All TODO comments indicate where to add database integration later.

// below this is the new login routes
