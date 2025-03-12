import { Employee, EmployeeAttributes } from "../models/employeeModel";
import { Request, Response } from "express";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { error } from "console";
import ApiError from "../utils/apiError";
import { StatusCode } from "../utils/apiResponse";

export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await Employee.findAll();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: "Error fetching employees" });
  }
};

// export const createEmployee = async () => {
//   const newEmployee = await Employee.create({
//     FirstName: "John",
//     LastName: "Doe",
//     Email: "john.doe@example.com",
//     PhoneNumber: "1234567890",
//     EmploymentStatus: "Active",
//     RoleID: 1,
//     Password: "hashedpassword", // Make sure to hash passwords in real applications
//   });

//   console.log("Employee created:", newEmployee.toJSON());
// };

// Adjust the path to your Employee model

// Adjust the path to your Employee model

export const createEmployee = async (
  req: Request<{}, {}, EmployeeAttributes>,
  res: Response
): Promise<void> => {
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    employmentStatus,
    role,
    password,
  } = req.body;

  try {
    // Check if the employee email already exists
    const existingEmployee = await Employee.findOne({ where: { email } });
    if (existingEmployee) {
      res.status(400).json({ error: "Email already exists" });
    } else {
      const hashedPassword = await bcrypt.hash(password!, 10);
      // Create a new Employee instance and save it to the database
      const newEmployee = await Employee.create({
        firstName,
        lastName,
        email,
        phoneNumber,
        employmentStatus,
        role,
        password: hashedPassword,
      });

      // Send the success response, no need to return the res object explicitly
      res
        .status(201)
        .json({ message: "Employee created successfully", data: newEmployee });
    }
  } catch (error) {
    console.error(error); // Optional, for debugging
    res.status(500).json({ error: "Server error" });
  }
};

// TODO::
// capitalization needs to be changed

export const loginEmployee = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { Email, Password } = req.body;

  try {
    const employee = await Employee.findOne({ where: { email: Email } });
    if (!employee) {
      res.status(401).json({ error: "Invalid credentials" });
    } else {
      const isMatch = await bcrypt.compare(Password, employee.password!);
      if (!isMatch) {
        res.status(401).json({ error: "Invalid Credentials" });
      } else {
        const token = jwt.sign(
          {
            EmployeeID: employee.id,
            Email: employee.email,
            RoleID: employee.id,
          },
          process.env.JWT_SECRET as string,
          { expiresIn: "2h" }
        );
        res.json({ token });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
