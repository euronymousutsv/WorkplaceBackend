import Employee from "../models/userModel";
import { Request, Response } from "express";
export const getAllEmployees = async (req: Request, res: Response) => {
    try {
      const employees = await Employee.findAll();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ error: "Error fetching employees" });
    }
  };

export const createEmployee = async () => {
  const newEmployee = await Employee.create({
    FirstName: "John",
    LastName: "Doe",
    Email: "john.doe@example.com",
    PhoneNumber: "1234567890",
    EmploymentStatus: "Active",
    RoleID: 1,
    Password: "hashedpassword", // Make sure to hash passwords in real applications
  });

  console.log("Employee created:", newEmployee.toJSON());
};


