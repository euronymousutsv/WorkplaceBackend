import { Request, Response } from 'express';
import { Employee } from '../models/employeeModel';
import { EmployeeDetails } from '../models/employeeDetails';

// Get all employees with their details
export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await Employee.findAll({
      include: [{
        model: EmployeeDetails,
        as: 'employeeDetails'
      }]
    });

    res.status(200).json({
      success: true,
      data: employees
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employees',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get employee by ID with their details
export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const employee = await Employee.findByPk(id, {
      include: [{
        model: EmployeeDetails,
        as: 'employeeDetails'
      }]
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
