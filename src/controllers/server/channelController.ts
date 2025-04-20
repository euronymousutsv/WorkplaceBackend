import { Request, Response } from "express";
import ApiError from "../../utils/apiError";
import ApiResponse, { StatusCode } from "../../utils/apiResponse";
import Channel, { Roles } from "../../models/channelModel";
import { getAccessToken } from "../../utils/helper";
import { verifyAccessToken } from "../../utils/jwtGenerater";
import { OfficeLocation } from "../../models/officeLocation";
import { Console } from "console";

// Function to create a new channel inside a server
const createNewChannel = async (
  req: Request<
    {},
    {},
    {
      officeId: string;
      channelName: string;
    }
  >,
  res: Response
): Promise<void> => {
  const { officeId, channelName } = req.body;

  try {
    if (!officeId || !channelName)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "Make sure both Office id and Channel Name is provided."
      );

    const searchedOffice = await OfficeLocation.findOne({
      where: { id: officeId },
    });

    if (!searchedOffice)
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Office Not found");

    console.log(searchedOffice);

    const newChannel = await Channel.create({
      name: channelName,
      officeId,
    });

    console.log("new channel", newChannel);

    if (!newChannel)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "Unable to create Channel"
      );

    res
      .status(201)
      .json(
        new ApiResponse(
          StatusCode.CREATED,
          newChannel,
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

// function to fetch all the channels current server has.
const getAllChannelForCurrentOffice = async (
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
        "Make sure both Office Id is provided."
      );

    const accessToken = getAccessToken(req);
    const role = verifyAccessToken(accessToken)?.role;

    const allChannel = await Channel.findAll({
      where: { officeId },
    });

    const accessibleChannels = allChannel.filter((channel) => {
      const required = channel.highestRoleToAccessChannel;

      if (role === "admin") {
        return true; // admin has access to all
      }

      if (role === "manager") {
        return (
          required === null ||
          required === Roles.EMPLOYEE ||
          required === Roles.MANAGER
        );
      }

      if (role === "employee") {
        return required === null || required === Roles.EMPLOYEE;
      }

      return false; // any other roles don't get access
    });

    if (accessibleChannels.length <= 0) {
      throw new ApiError(StatusCode.NOT_FOUND, {}, "No Channels found");
    }

    res
      .status(201)
      .json(
        new ApiResponse(
          StatusCode.CREATED,
          accessibleChannels,
          "All channels fetched"
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

// function to delete the channel
const deleteChannel = async (
  req: Request<
    {},
    {},
    {},
    {
      channelId: string;
    }
  >,
  res: Response
): Promise<void> => {
  const { channelId } = req.query;
  console.log(channelId);
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

// function to change the current channel name
const changeAChannelName = async (
  req: Request<
    {},
    {},
    {
      channelId: string;
      newChannelName: string;
    }
  >,
  res: Response
): Promise<void> => {
  const { channelId, newChannelName } = req.body;

  try {
    if (!channelId || !newChannelName)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "Make sure both Channel id and New Channel Name is provided."
      );

    const searchedChannel = await Channel.findOne({ where: { id: channelId } });

    if (!searchedChannel)
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Channel Not found");

    searchedChannel.name = newChannelName;
    await searchedChannel.save();

    res
      .status(201)
      .json(
        new ApiResponse(
          StatusCode.CREATED,
          searchedChannel.dataValues,
          "Channel Name changed Successfully!"
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

// function to add access to a channel
const addAccessToChannel = async (
  req: Request<
    {},
    {},
    {
      channelId: string;
      highestRoleToAccessServer: Roles;
    }
  >,
  res: Response
): Promise<void> => {
  const { channelId, highestRoleToAccessServer } = req.body;

  try {
    if (!channelId)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { serverId: "" },
        "Channel; Id is missing"
      );

    if (
      !highestRoleToAccessServer ||
      !Object.values(Roles).includes(highestRoleToAccessServer)
    ) {
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {
          highestRoleToAccessServer: "",
          possiobleOptions: ["admin", "employee", "manager"],
        },
        "Highest role to access channel is missing or incorrect value provided "
      );
    }

    const searchedChannel = await Channel.findOne({ where: { id: channelId } });

    if (!searchedChannel)
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Channel Not found");

    searchedChannel.highestRoleToAccessChannel = highestRoleToAccessServer;
    await searchedChannel.save();

    res
      .status(201)
      .json(
        new ApiResponse(
          StatusCode.CREATED,
          searchedChannel.changed,
          "Channel Access Updated Successfully!"
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

// function to get a channel full details
const getChannelDetails = async (
  req: Request<
    {},
    {},
    {},
    {
      channelId: string;
    }
  >,
  res: Response
): Promise<void> => {
  const { channelId } = req.query;

  try {
    if (!channelId)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { serverId: "" },
        "Channel; Id is missing"
      );

    const searchedChannel = await Channel.findOne({ where: { id: channelId } });

    if (!searchedChannel)
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Channel Not found");

    res
      .status(201)
      .json(
        new ApiResponse(
          StatusCode.CREATED,
          searchedChannel.dataValues,
          "Channel Access Updated Successfully!"
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
  createNewChannel,
  getAllChannelForCurrentOffice,
  deleteChannel,
  addAccessToChannel,
  changeAChannelName,
  getChannelDetails,
};
