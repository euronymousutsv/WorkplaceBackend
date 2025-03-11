import { Request, Response } from "express";
import Api from "twilio/lib/rest/Api";
import ApiError from "../utils/apiError";
import ApiResponse, { StatusCode } from "../utils/apiResponse";
import Server from "../models/serverModel";
import { UUIDV4 } from "sequelize";
import { randomUUID } from "crypto";
import Channel from "../models/channelModel";

const createNewChannel = async (
  req: Request<
    {},
    {},
    {
      serverId: string;
      channelName: string;
    }
  >,
  res: Response
): Promise<void> => {
  const { serverId, channelName } = req.body;

  try {
    if (!serverId || !channelName)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "Make sure both Server id and Channel Name is provided."
      );

    // Todo:: limit the character in the channel name

    const newChannel = Channel.create({
      name: channelName,
      serverId: serverId,
    });

    const savedChannel = (await newChannel).save();
    if (!savedChannel)
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Unable to create Server");

    res
      .status(201)
      .json(
        new ApiResponse(
          StatusCode.CREATED,
          (await savedChannel).dataValues,
          "New Channel created successfull!"
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

export { createNewChannel };
