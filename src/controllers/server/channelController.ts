import { Request, Response } from "express";
import ApiError from "../../utils/apiError";
import ApiResponse, { StatusCode } from "../../utils/apiResponse";
import Channel from "../../models/channelModel";

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

const getAllChannelForCurrentServer = async (
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
        "Make sure both Server is provided."
      );

    const allChannel = await Channel.findAll({ where: { serverId: serverId } });
    if (allChannel.length <= 0) {
      throw new ApiError(StatusCode.NOT_FOUND, {}, "No Channels found");
    }

    res
      .status(201)
      .json(
        new ApiResponse(StatusCode.CREATED, allChannel, "All channels fetched")
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

const deleteChannel = async (
  req: Request<
    {},
    {},
    {
      channelId: string;
    }
  >,
  res: Response
): Promise<void> => {
  const { channelId } = req.body;

  try {
    if (!channelId)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { channelId: "" },
        "Make sure Channel Id is provided."
      );

    const searchedChannel = await Channel.findOne({ where: { id: channelId } });
    if (!searchedChannel)
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Channel Not found");
    searchedChannel?.destroy();
    res
      .status(200)
      .json(
        new ApiResponse(StatusCode.CREATED, searchedChannel, "Channel deleted")
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

export { createNewChannel, getAllChannelForCurrentServer, deleteChannel };
