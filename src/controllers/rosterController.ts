import { Request, Response } from "express";
import { Roster, RosterAttributes } from "../models/rosterModel";
import { Employee } from "../models/employeeModel";
import { OfficeLocation } from "../models/officeLocation";
import { Op } from "sequelize";
import sequelize from "../config/db";
import ApiError from "../utils/apiError";
import ApiResponse, { StatusCode } from "../utils/apiResponse";
import { verifyAccessToken } from "../utils/jwtGenerater";
import Server from "../models/serverModel";

// ✅ **1. Create a Shift**
const createShift = async (
  req: Request<{}, {}, RosterAttributes>,
  res: Response
): Promise<void> => {
  const { employeeId, officeId, startTime, endTime, date, description } =
    req.body;

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
      date,
      description,
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

// not working fix req
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
  const { officeId, startTime, endTime, date, description } = req.body;

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
      date,
      description,
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

export const getShiftsForLoggedInUser = async (
  req: Request<
    {},
    {},
    {},
    {
      accessToken: string;
    }
  >,
  res: Response
): Promise<void> => {
  const { accessToken } = req.query;

  try {
    if (!accessToken)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "Access Token cannot be empty."
      );

    const decoded = verifyAccessToken(accessToken);
    const userId = decoded?.userId;

    const allShifts = await Roster.findAll({
      where: { employeeId: userId },
      include: [
        {
          model: OfficeLocation,
          as: "officeLocation",
        },
      ],
    });

    if (allShifts.length <= 0) {
      res
        .status(201)
        .json(
          new ApiResponse(StatusCode.OK, allShifts!, "No Shifts avaivable")
        );
    }

    res
      .status(201)
      .json(
        new ApiResponse(
          StatusCode.CREATED,
          allShifts!,
          "Shifts fetched successfully"
        )
      );
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json(error);
    } else {
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json(
          new ApiError(
            StatusCode.INTERNAL_SERVER_ERROR,
            {},
            "Something went wrong."
          )
        );
    }
  }
};

// fetch all shifts in a office
export const getShiftsForOffice = async (
  req: Request<
    {},
    {},
    {},
    {
      officeId: string;
    }
  >,
  res: Response
): Promise<void> => {
  const { officeId } = req.query;

  try {
    if (!officeId)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { officeId: "" },
        "officeId cannot be empty."
      );

    const allShifts = await Roster.findAll({
      where: { officeId: officeId },
    });

    if (allShifts.length <= 0) {
      res
        .status(201)
        .json(
          new ApiResponse(StatusCode.OK, allShifts!, "No Shifts avaivable")
        );
    }

    res
      .status(201)
      .json(
        new ApiResponse(
          StatusCode.CREATED,
          allShifts!,
          "Shifts fetched successfully"
        )
      );
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json(error);
    } else {
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json(
          new ApiError(
            StatusCode.INTERNAL_SERVER_ERROR,
            {},
            "Something went wrong."
          )
        );
    }
  }
};

// 🆗 working
// get all offices in a server
export const getAllOffices = async (
  req: Request<
    {},
    {},
    {},
    {
      serverId: string;
    }
  >,
  res: Response
): Promise<void> => {
  const { serverId } = req.query;

  try {
    if (!serverId)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { serverId: "" },
        "serverId cannot be empty."
      );

    const allOffice = await OfficeLocation.findAll({
      where: { serverId },
    });

    if (allOffice.length <= 0) {
      res
        .status(201)
        .json(
          new ApiResponse(StatusCode.OK, allOffice!, "No Offices avaivable")
        );
    } else {
      res
        .status(201)
        .json(
          new ApiResponse(
            StatusCode.CREATED,
            allOffice!,
            "Offices fetched successfully"
          )
        );
    }
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json(error);
    } else {
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json(
          new ApiError(
            StatusCode.INTERNAL_SERVER_ERROR,
            {},
            "Something went wrong."
          )
        );
    }
  }
};

// create a new office location for a server
export const createOffice = async (
  req: Request<
    {},
    {},
    {},
    {
      serverId: string;
      lat: string;
      long: string;
      radius: string;
      name: string;
    }
  >,
  res: Response
): Promise<void> => {
  const { serverId, lat, long, radius, name } = req.query;

  try {
    if (!serverId)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { serverId: "" },
        "serverId cannot be empty."
      );

    if (!lat || !long)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { lat: null, long: null },
        "Latitute or Longitute is empty"
      );

    if (!name)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { name: null },
        "Name cannot be empty"
      );

    const latitude = lat ? parseFloat(lat) : 0;
    const longitude = long ? parseFloat(long) : 0;
    const radiusValue = radius ? parseFloat(radius) : 5; // Default to 5 if undefined

    if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusValue)) {
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { serverId: "" },
        "Invalid numerical values"
      );
    }
    // Check if the server exists
    const searchedServer = await Server.findOne({
      where: { id: serverId },
    });

    if (!searchedServer)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { serverId: "" },
        "Server not found"
      );

    const newOffice = await OfficeLocation.create({
      latitude,
      longitude,
      radius: radiusValue,
      serverId,
      name,
    });

    res
      .status(201)
      .json(
        new ApiResponse(
          StatusCode.CREATED,
          newOffice.dataValues,
          "New office Created"
        )
      );
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json(error);
    } else {
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json(
          new ApiError(
            StatusCode.INTERNAL_SERVER_ERROR,
            {},
            "Something went wrong."
          )
        );
    }
  }
};

export { createShift, deleteShift, autoAssignShifts, getShifts, updateShift };
