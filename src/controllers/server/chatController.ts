import { Request, Response } from "express";
import ApiError from "../../utils/apiError";
import ApiResponse, { StatusCode } from "../../utils/apiResponse";
import Chat from "../../models/chatModel";
import { Employee } from "../../models/employeeModel";

// send a message to a channel
const sendMessage = async (
  req: Request<
    {},
    {},
    {
      userId: string;
      message: string;
      channelId: string;
    }
  >,
  res: Response
): Promise<void> => {
  const { userId, message, channelId } = req.body;

  try {
    if (!userId)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { userId: "" },
        "User details not provided"
      );

    if (!message)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { message: "" },
        "Message cannot be empty"
      );
    if (!channelId)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { channelId: "" },
        "Please mention the channel"
      );

    const savedMessage = await Chat.create({ userId, message, channelId });

    res
      .status(201)
      .json(new ApiResponse(StatusCode.CREATED, savedMessage, "Message sent"));
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

// update previously sent message in a channel
const updateMessage = async (
  req: Request<
    {},
    {},
    {
      messageId: string;
      message: string;
    }
  >,
  res: Response
): Promise<void> => {
  const { messageId, message } = req.body;

  try {
    if (!messageId)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { messageId: "" },
        "Message Id not provided"
      );

    if (!message)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { message: "" },
        "New message cannot be empty."
      );

    const searchedMessage = await Chat.findOne({ where: { id: message } });
    if (!searchedMessage)
      throw new ApiError(StatusCode.NOT_FOUND, {}, "Message not found");

    searchedMessage.message = message;
    const savedMessage = await searchedMessage.save();
    if (!savedMessage)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "Unable to update message"
      );

    res
      .status(201)
      .json(
        new ApiResponse(
          StatusCode.CREATED,
          savedMessage.dataValues,
          "Message sent"
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

// delete a message in a channel
const deleteMessage = async (
  req: Request<
    {},
    {},
    {
      messageId: string;
      currentUserId: string;
    }
  >,
  res: Response
): Promise<void> => {
  const { messageId, currentUserId } = req.body;

  try {
    if (!messageId)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { messageId: "" },
        "Message Id not provided"
      );

    if (!currentUserId)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { currentUserId: "" },
        "Current user Id cannot be empty."
      );

    const searchedUser = await Employee.findOne({
      where: { id: currentUserId },
    });
    if (!searchedUser)
      throw new ApiError(StatusCode.NOT_FOUND, {}, "User not found");

    const searchedMessage = await Chat.findOne({ where: { id: messageId } });
    if (!searchedMessage)
      throw new ApiError(StatusCode.NOT_FOUND, {}, "Message not found");

    if (searchedMessage.userId != currentUserId)
      throw new ApiError(
        StatusCode.CONFLICT,
        {},
        "The message doesn't belong to the user"
      );

    await searchedMessage.destroy();

    res.status(201).json(new ApiResponse(StatusCode.OK, {}, "Message deleted"));
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

export { sendMessage, updateMessage, deleteMessage };
