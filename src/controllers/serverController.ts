import { Request, Response } from "express";
import Api from "twilio/lib/rest/Api";
import ApiError from "../utils/apiError";
import ApiResponse, { StatusCode } from "../utils/apiResponse";
import Server from "../models/serverModel";
import { UUIDV4 } from "sequelize";
import { randomUUID } from "crypto";

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

export { registerServer };
