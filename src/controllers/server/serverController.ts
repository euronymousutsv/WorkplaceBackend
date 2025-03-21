import { Request, Response } from "express";
import Api from "twilio/lib/rest/Api";
import ApiError from "../../utils/apiError.js";
import ApiResponse, { StatusCode } from "../../utils/apiResponse.js";
import Server from "../../models/serverModel.js";
import { UUIDV4, where } from "sequelize";
import { randomUUID } from "crypto";
import { verifyAccessToken } from "../../utils/jwtGenerater.js";
import { Employee } from "../../models/employeeModel.js";
import JoinedServer from "../../models/joinedServerModel.js";
import { server } from "../../config/socket.js";

const registerServer = async (
  req: Request<
    {},
    {},
    {
      serverName: string;
      idVerificationRequired: boolean;
      ownerId: string;
    }
  >,
  res: Response
): Promise<void> => {
  const { serverName, idVerificationRequired = false, ownerId } = req.body;

  try {
    if (!serverName)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "Please enter a valid Server Name"
      );

    if (!ownerId) {
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "Something went wrong. The owner Id cant be empty."
      );
    }

    //todo :: In future : make sure an owner can only have one server
    // add conditions

    const inviteCode = randomUUID().slice(0, 8);

    const newServer = Server.create({
      name: serverName,
      idVerificationRequired,
      ownerId,
      inviteLink: inviteCode,
    });

    const savedServer = (await newServer).save();
    if (!savedServer)
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Unable to create Server");

    res
      .status(201)
      .json(
        new ApiResponse(
          StatusCode.CREATED,
          (await savedServer).dataValues,
          "Server Regestration successfull!"
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

const joinServer = async (
  req: Request<
    {},
    {},
    {
      inviteCode: string;
      accessToken: string;
    }
  >,
  res: Response
): Promise<void> => {
  const { inviteCode, accessToken } = req.body;

  try {
    if (!inviteCode)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { inviteId: "" },
        "Invide Code cannot be empty"
      );

    if (!accessToken)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "Access Token cannot be empty."
      );
    const decoded = verifyAccessToken(accessToken);
    const userId = decoded?.userId;

    const searchedServer = await Server.findOne({
      where: { inviteLink: inviteCode },
    });
    if (!searchedServer)
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Server not found.");

    const joinServer = await JoinedServer.create({
      id: userId,
      serverId: searchedServer.id,
    });

    if (!joinServer)
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Unable to join a server");
    res
      .status(201)
      .json(
        new ApiResponse(StatusCode.CREATED, searchedServer, "Joined Success!")
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

const getLoggedInUserServer = async (
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

    const joinedServer = await JoinedServer.findOne({ where: { id: userId } });
    if (!joinedServer)
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Server Not found");
    res
      .status(201)
      .json(new ApiResponse(StatusCode.CREATED, joinedServer!, "Server found"));
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

export { registerServer, getLoggedInUserServer, joinServer };
