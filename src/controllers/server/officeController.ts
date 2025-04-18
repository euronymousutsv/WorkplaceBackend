import { Request, Response } from "express";
import { Roster } from "../../models/rosterModel";
import { OfficeLocation } from "../../models/officeLocation";
import ApiError from "../../utils/apiError";
import ApiResponse, { StatusCode } from "../../utils/apiResponse";
import Server from "../../models/serverModel";
import { EventEmitter } from "stream";
import { Employee } from "../../models/employeeModel";
import JoinedOffice from "../../models/joinedOfficeModel";
import { getAccessToken } from "src/utils/helper";
import { verifyAccessToken } from "src/utils/jwtGenerater";

enum OfficeDetails {
  ID = "id",
  SERVER_ID = "serverId",
  LATITUDE = "latitude",
  LONGITUDE = "longitude",
  RADIUS = "radius",
  NAME = "name",
}
// // fetch all shifts in a office
const getShiftsForOffice = async (
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

// get all offices in a server
const getAllOffices = async (
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

// get all employees in a office
const getAllEmployeesInOffice = async (
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

    const allOffice = await JoinedOffice.findAll({
      where: { officeId },
    });

    if (allOffice.length <= 0) {
      res
        .status(201)
        .json(
          new ApiResponse(
            StatusCode.OK,
            allOffice!,
            "No Employees in this office"
          )
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
const createOffice = async (
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

// update officeDetails
const updateOfficeDetails = async (
  req: Request<
    {},
    {},
    {},
    {
      officeId: string;
      editField: OfficeDetails;
      newValue: string;
    }
  >,
  res: Response
): Promise<void> => {
  const { officeId, editField, newValue } = req.query;

  try {
    if (!officeId)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { officeId: "" },
        "officeId cannot be empty."
      );

    if (!editField)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { editField: null },
        "Edit field cannot be empty"
      );

    if (!newValue)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { newValue: null },
        "New value cannot be empty"
      );

    // Check if the office exists
    const searchedOffice = await OfficeLocation.findOne({
      where: { id: officeId },
    });
    if (!searchedOffice)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { officeId: "" },
        "Office not found"
      );
    // Update the office details based on the editField
    switch (editField) {
      case OfficeDetails.LATITUDE:
        searchedOffice.latitude = parseFloat(newValue);
        break;
      case OfficeDetails.LONGITUDE:
        searchedOffice.longitude = parseFloat(newValue);
        break;
      case OfficeDetails.RADIUS:
        searchedOffice.radius = parseFloat(newValue);
        break;
      case OfficeDetails.NAME:
        searchedOffice.name = newValue;
        break;
      default:
        throw new ApiError(
          StatusCode.BAD_REQUEST,
          { editField: null },
          "Invalid edit field"
        );
    }

    // Save the updated office details
    const updatedOffice = await searchedOffice.save();
    if (!updatedOffice)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "Unable to update office details"
      );

    res
      .status(201)
      .json(
        new ApiResponse(
          StatusCode.CREATED,
          searchedOffice.dataValues,
          "Office details updated successfully"
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

const joinAnEmployeeToOffice = async (
  req: Request<
    {},
    {},
    {},
    {
      officeId: string;
      employeeId: string;
    }
  >,
  res: Response
): Promise<void> => {
  const { officeId, employeeId } = req.query;
  try {
    if (!officeId)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { officeId: "" },
        "officeId cannot be empty."
      );
    if (!employeeId)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { employeeId: "" },
        "employeeId cannot be empty."
      );
    // Check if the office exists
    const searchedOffice = await OfficeLocation.findOne({
      where: { id: officeId },
    });
    if (!searchedOffice)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { officeId: "" },
        "Office not found"
      );

    // Check if the employee exists
    const searchedEmployee = await Employee.findOne({
      where: { id: employeeId },
    });

    if (!searchedEmployee)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { employeeId: "" },
        "Employee not found"
      );

    // Check if the employee is already joined to the office
    const joinedOffice = await JoinedOffice.findOne({
      where: { id: employeeId },
    });
    console.log("joining office");

    if (joinedOffice)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { officeId: "" },
        "Employee already joined to the office"
      );

    // Join the employee to the office
    const newJoinedOffice = await JoinedOffice.create({
      officeId: officeId,
      id: employeeId,
    });
    if (!newJoinedOffice)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "Unable to join employee to the office"
      );
    res
      .status(201)
      .json(
        new ApiResponse(
          StatusCode.CREATED,
          newJoinedOffice.dataValues,
          "Employee joined to the office successfully"
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

export {
  getShiftsForOffice,
  getAllEmployeesInOffice,
  getAllOffices,
  createOffice,
  updateOfficeDetails,
  joinAnEmployeeToOffice,
};
