import { Request, Response } from "express";
import ApiError from "../../utils/apiError";
import ApiResponse, { StatusCode } from "../../utils/apiResponse";
import Chat from "../../models/chatModel";
import { Employee } from "../../models/employeeModel";
import { io } from "../../config/socket";
import { createNotification } from "../notificationController";

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
    // emit message to all clients in this channel

    // trial check
    // working
    // todo :
    // await createNotification(
    //   "ExponentPushToken[stgllcG3B8A8hTp7ScLR0x]",
    //   userId,
    //   "Pranish send a message",
    //   message
    // );

    io.to(channelId).emit("newMessage", savedMessage);

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
// todo :: fix an error where if the passed id is not a uuid, it shows general error. Wheras it needs to send that it is not uuid

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
        { messageId: undefined },
        "Message Id not provided"
      );

    if (!message)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { message: "" },
        "New message cannot be empty."
      );

    const searchedMessage = await Chat.findOne({ where: { id: messageId } });
    console.log("...");
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
    // Emit the updated message to all clients
    io.to(savedMessage.channelId).emit("updatedMessage", savedMessage);

    res
      .status(201)
      .json(
        new ApiResponse(
          StatusCode.CREATED,
          savedMessage.dataValues,
          "Message updated"
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
    // Emit the deleted message to all clients in the channel
    io.to(searchedMessage.channelId).emit("deletedMessage", messageId);

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

// get all chats by channel
const getChatsByChannel = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { channelId } = req.params;
  // Get pagination parameters from the query string
  const page = parseInt(req.query.page as string) || 1; // Default to page 1 if not provided
  const limit = parseInt(req.query.limit as string) || 10; // Default to 10 results per page if not provided

  try {
    if (!channelId)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { userId: "" },
        "Channnel Id not provided"
      );

    // Calculate the offset for pagination
    const offset = (page - 1) * limit;

    // Get the paginated chats from the database
    const chats = await Chat.findAll({
      where: { channelId },
      order: [["createdAt", "DESC"]],
      limit: limit,
      offset: offset,
      include: {
        model: Employee,
        as: "Employee",
        attributes: [
          "firstName",
          "email",
          "phoneNumber",
          "employmentStatus",
          "role",
          "profileImage",
        ],
      },
    });

    // If no chats found, return a 404 error
    if (chats.length === 0) {
      throw new ApiError(
        StatusCode.NOT_FOUND,
        {},
        "No chats found for this channel"
      );
    }

    // Calculate the total number of chats to determine the total pages
    const totalChats = await Chat.count({ where: { channelId } });
    const totalPages = Math.ceil(totalChats / limit);

    res.status(StatusCode.OK).json(
      new ApiResponse(
        StatusCode.CREATED,
        {
          chats,
          page,
          limit,
          totalPages,
          totalChats,
        },
        "Chats fetched successfully"
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
            "Failed to fetch chats."
          )
        );
    }
  }
};

export { sendMessage, updateMessage, deleteMessage, getChatsByChannel };
