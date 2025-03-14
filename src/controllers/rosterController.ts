import { Request, Response } from "express";
import { Roster, RosterAttributes } from "../models/rosterModel";
import { Employee } from "../models/employeeModel";
import { OfficeLocation } from "../models/officeLocation";
import { Op } from "sequelize";
import sequelize from "../config/db";

// ✅ **1. Create a Shift**
const createShift = async (
  req: Request<{}, {}, RosterAttributes>,
  res: Response
): Promise<void> => {
  const { employeeId, officeId, startTime, endTime } = req.body;

  try {
    // Ensure employee and office exist
    const employee = await Employee.findByPk(employeeId);
    const office = await OfficeLocation.findByPk(officeId);
    if (!employee || !office) {
      res.status(404).json({ error: "Employee or Office not found" });
      return;
    }

    // Create the shift
    const shift = await Roster.create({
      employeeId,
      officeId,
      startTime,
      endTime,
    });

    res.status(201).json({ message: "Shift created successfully", shift });
    return;
  } catch (error) {
    console.error("Error creating shift:", error);
    res.status(500).json({ error: "Server error" });
    return;
  }
};

// ✅ **2. Update a Shift**
const updateShift = async (
  req: Request<{ id: string }, {}, RosterAttributes>,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  console.log(id);
  const { employeeId, officeId, startTime, endTime } = req.body;

  try {
    const shift = await Roster.findByPk(id);
    console.log(id);
    if (!shift) {
      res.status(404).json({ error: "Shift not found" });
      return;
    }

    await shift.update({ employeeId, officeId, startTime, endTime });

    res.status(200).json({ message: "Shift updated successfully", shift });
  } catch (error) {
    console.error("Error updating shift:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ **3. Delete a Shift**
const deleteShift = async (
  req: Request<{ id: string }, {}, RosterAttributes>,
  res: Response
) => {
  const { id } = req.params;

  try {
    const shift = await Roster.findByPk(id);
    if (!shift) {
      res.status(404).json({ error: "Shift not found" });
      return;
    }

    await shift.destroy();

    res.status(200).json({ message: "Shift deleted successfully" });
    return;
  } catch (error) {
    console.error("Error deleting shift:", error);
    res.status(500).json({ error: "Server error" });
    return;
  }
};

// ✅ **4. Get All Shifts (Optional: Filter by Employee, Office, or Date Range)**
const getShifts = async (
  req: Request<{}, {}, RosterAttributes>,
  res: Response
) => {
  const { employeeId, officeId, startDate, endDate } = req.query;

  const filters: any = {};
  if (employeeId) filters.employeeId = employeeId;
  if (officeId) filters.officeId = officeId;
  if (startDate && endDate) {
    filters.startTime = { [Op.between]: [startDate, endDate] };
  }

  try {
    const shifts = await Roster.findAll({
      where: filters,
      include: [{ model: Employee }, { model: OfficeLocation }],
    });

    res.status(200).json({ shifts });
    return;
  } catch (error) {
    console.error("Error fetching shifts:", error);
    res.status(500).json({ error: "Server error" });
    return;
  }
};

// ✅ **5. Auto-Assign Employees to Available Shifts**
const autoAssignShifts = async (
  req: Request<{}, {}, RosterAttributes>,
  res: Response
) => {
  const { officeId, startTime, endTime } = req.body;

  try {
    // Find employees who are not already assigned to a shift at this time
    const availableEmployees = await Employee.findAll({
      where: {
        id: {
          [Op.notIn]: sequelize.literal(
            `(SELECT employeeId FROM rosters WHERE startTime <= '${endTime}' AND endTime >= '${startTime}')`
          ),
        },
      },
    });

    if (availableEmployees.length === 0) {
      res.status(400).json({ error: "No available employees for this shift" });
      return;
    }

    const assignedEmployee = availableEmployees[0];

    // Create the shift with the first available employee
    const shift = await Roster.create({
      employeeId: assignedEmployee.id,
      officeId,
      startTime,
      endTime,
    });

    res
      .status(201)
      .json({ message: "Shift auto-assigned successfully", shift });
    return;
  } catch (error) {
    console.error("Error auto-assigning shifts:", error);
    res.status(500).json({ error: "Server error" });
    return;
  }
};

export { createShift, deleteShift, autoAssignShifts, getShifts, updateShift };
