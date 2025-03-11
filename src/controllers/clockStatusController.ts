import { Request, Response } from 'express';
import { AttendanceEvent } from '../models/attendancModel';
import { Employee } from '../models/employeeModel';
import { Op } from 'sequelize';

// ✅ **1. Clock In**
export const clockIn = async (req: Request, res: Response) => {
  const { employeeId } = req.body;

  try {
    // Validate employee existence
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Ensure employee is not already clocked in
    const existingClockIn = await AttendanceEvent.findOne({
      where: {
        employeeId,
        clockStatus: 'clock_in',
        eventDate: new Date().toISOString().split('T')[0], // Only check for today's clock-ins
      },
    });

    if (existingClockIn) {
      return res.status(400).json({ error: 'You are already clocked in. Please clock out first.' });
    }

    // Create clock-in record
    const clockInEvent = await AttendanceEvent.create({
      employeeId,
      eventDate: new Date(),
      eventTime: new Date(),
      clockStatus: 'clock_in',
    });

    return res.status(201).json({ message: 'Clock-in successful', clockInEvent });
  } catch (error) {
    console.error('Error during clock-in:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// ✅ **2. Clock Out**
export const clockOut = async (req: Request, res: Response) => {
  const { employeeId } = req.body;

  try {
    // Find latest clock-in event
    const lastClockIn = await AttendanceEvent.findOne({
      where: {
        employeeId,
        clockStatus: 'clock_in',
      },
      order: [['eventTime', 'DESC']],
    });

    if (!lastClockIn) {
      return res.status(400).json({ error: 'You are not clocked in.' });
    }

    // Create clock-out record
    const clockOutEvent = await AttendanceEvent.create({
      employeeId,
      eventDate: new Date(),
      eventTime: new Date(),
      clockStatus: 'clock_out',
    });

    return res.status(201).json({ message: 'Clock-out successful', clockOutEvent });
  } catch (error) {
    console.error('Error during clock-out:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// ✅ **3. Start Break**
export const startBreak = async (req: Request, res: Response) => {
  const { employeeId } = req.body;

  try {
    // Check if employee is clocked in
    const lastClockIn = await AttendanceEvent.findOne({
      where: { employeeId, clockStatus: 'clock_in' },
      order: [['eventTime', 'DESC']],
    });

    if (!lastClockIn) {
      return res.status(400).json({ error: 'You must be clocked in to start a break.' });
    }

    // Create break start record
    const breakStartEvent = await AttendanceEvent.create({
      employeeId,
      eventDate: new Date(),
      eventTime: new Date(),
      clockStatus: 'break_start',
    });

    return res.status(201).json({ message: 'Break started successfully', breakStartEvent });
  } catch (error) {
    console.error('Error during break start:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// ✅ **4. End Break**
export const endBreak = async (req: Request, res: Response) => {
  const { employeeId } = req.body;

  try {
    // Check if the employee has started a break
    const lastBreakStart = await AttendanceEvent.findOne({
      where: { employeeId, clockStatus: 'break_start' },
      order: [['eventTime', 'DESC']],
    });

    if (!lastBreakStart) {
      return res.status(400).json({ error: 'You must start a break before ending it.' });
    }

    // Create break end record
    const breakEndEvent = await AttendanceEvent.create({
      employeeId,
      eventDate: new Date(),
      eventTime: new Date(),
      clockStatus: 'break_end',
    });

    return res.status(201).json({ message: 'Break ended successfully', breakEndEvent });
  } catch (error) {
    console.error('Error during break end:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// ✅ **5. Get Employee Attendance Records**
export const getEmployeeAttendance = async (req: Request, res: Response) => {
  const { employeeId } = req.params;

  try {
    const attendanceRecords = await AttendanceEvent.findAll({
      where: { employeeId },
      order: [['eventTime', 'DESC']],
    });

    return res.status(200).json({ attendanceRecords });
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// ✅ **6. Get All Attendance Records for Admin (Optional: Filter by Date)**
export const getAllAttendance = async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;

  const filters: any = {};
  if (startDate && endDate) {
    filters.eventDate = { [Op.between]: [startDate, endDate] };
  }

  try {
    const attendanceRecords = await AttendanceEvent.findAll({
      where: filters,
      include: [{ model: Employee }],
      order: [['eventTime', 'DESC']],
    });

    return res.status(200).json({ attendanceRecords });
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};