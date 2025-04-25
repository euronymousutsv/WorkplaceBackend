// types/EmployeeProfileViewModel.ts
import { Employee } from "../models/employeeModel";
import { EmployeeDetails } from "../models/employeeDetails";
export interface EmployeeProfileViewModel {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  role: "admin" | "employee" | "manager";
  employmentStatus: "Active" | "InActive" | "Leave" | "Terminated";
  profileImage?: string;

  details?: {
    username: string;
    baseRate: string;
    contractHours?: string;
    employeeType: "full-time" | "part-time" | "casual";
    department: string;
    position: string;
    managerId?: string;
    hireDate: Date;
  };
}
export const getAllEmployeeProfiles = async (): Promise<
  EmployeeProfileViewModel[]
> => {
  const employees = (await Employee.findAll({
    include: [
      {
        model: EmployeeDetails,
        as: "employeeDetails",
      },
    ],
  })) as (Employee & { employeeDetails?: EmployeeDetails })[];

  const profiles: EmployeeProfileViewModel[] = employees.map((emp) => ({
    id: emp.id,
    firstName: emp.firstName,
    lastName: emp.lastName,
    email: emp.email,
    phoneNumber: emp.phoneNumber,
    role: emp.role,
    employmentStatus: emp.employmentStatus,
    profileImage: emp.profileImage,
    details: emp.employeeDetails
      ? {
          username: emp.employeeDetails.username,
          baseRate: emp.employeeDetails.baseRate,
          contractHours: emp.employeeDetails.contractHours,
          employeeType: emp.employeeDetails.employeeType,
          department: emp.employeeDetails.department,
          position: emp.employeeDetails.position,
          //managerId: emp.employeeDetails.managerId,
          hireDate: emp.employeeDetails.hireDate,
        }
      : undefined,
  }));

  return profiles;
};

export const getEmployeeProfileById = async (
  id: string
): Promise<EmployeeProfileViewModel | null> => {
  const employee = (await Employee.findByPk(id, {
    include: [
      {
        model: EmployeeDetails,
        as: "employeeDetails",
      },
    ],
  })) as Employee & { employeeDetails?: EmployeeDetails };

  if (!employee) return null;

  const profile: EmployeeProfileViewModel = {
    id: employee.id,
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    phoneNumber: employee.phoneNumber,
    role: employee.role,
    employmentStatus: employee.employmentStatus,
    profileImage: employee.profileImage,
    details: employee.employeeDetails
      ? {
          username: employee.employeeDetails.username,
          baseRate: employee.employeeDetails.baseRate,
          contractHours: employee.employeeDetails.contractHours,
          employeeType: employee.employeeDetails.employeeType,
          department: employee.employeeDetails.department,
          position: employee.employeeDetails.position,
          //managerId: employee.employeeDetails.managerId,
          hireDate: employee.employeeDetails.hireDate,
        }
      : undefined,
  };

  return profile;
};
