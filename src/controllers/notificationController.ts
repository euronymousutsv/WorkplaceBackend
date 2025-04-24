import { Request, Response } from "express";
import { ExpoDeviceToken } from "../models/deviceTokenModel";
import { Employee } from "../models/employeeModel";
import ApiError from "../utils/apiError";
import ApiResponse, { StatusCode } from "../utils/apiResponse";
import { getAccessToken } from "../utils/helper";
import { verifyAccessToken } from "../utils/jwtGenerater";
import { Expo } from "expo-server-sdk";
import JoinedServer from "../models/joinedServerModel";
import Notification from "../models/Notifications";
import { where } from "sequelize";
import JoinedOffice from "../models/joinedOfficeModel";

// helper functions
const sendPushNotification = async (
  expoPushToken: string,
  title: string,
  body: string
) => {
  try {
    // Check if token is valid
    if (!Expo.isExpoPushToken(expoPushToken)) {
      console.error(
        `Push token ${expoPushToken} is not a valid Expo push token`
      );
      throw new ApiError(
        StatusCode.BAD_GATEWAY,
        {},
        `Push token ${expoPushToken} is not a valid Expo push token`
      );
    }

    const message = {
      to: expoPushToken,
      sound: "default",
      title,
      body,
      data: { withSome: "data" },
    };

    const chunks = expo.chunkPushNotifications([message]);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        throw new ApiError(
          StatusCode.BAD_GATEWAY,
          {},
          `Error sending push notification chunk`
        );
      }
    }

    return tickets;
  } catch (err) {
    console.error("Error sending push notification:", err);
  }
};

// notification in database
// sendPushNotification is called inside this function already. So no need to call that function again.
export const createNotification = async (
  userId: string,
  title: string,
  body: string
) => {
  // Validate input
  if (!userId || !title || !body) {
    throw new ApiError(
      StatusCode.BAD_REQUEST,
      {},
      "Missing userId, title, or body."
    );
  }

  // Create notification in the database
  const newNotification = await Notification.create({
    title,
    body,
    employeeId: userId,
  });

  if (!newNotification) {
    throw new ApiError(
      StatusCode.INTERNAL_SERVER_ERROR,
      {},
      "Unable to save notification in the database."
    );
  }

  const device = await ExpoDeviceToken.findOne({
    where: { employeeId: userId },
  });

  if (device) {
    await sendPushNotification(device.expoPushToken, title, body);
  } else {
    return;
  }

  return newNotification;
};

// fetch all api for an employee
const fetchAllNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const accessToken = getAccessToken(req);
    if (!accessToken)
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Access token not found.");

    const userId = verifyAccessToken(accessToken)?.userId;

    // Validate userId
    if (!userId) {
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Missing userId.");
    }

    console.log("userId", userId);
    // Fetch all notifications for the user from the database
    const notifications = await Notification.findAll({
      where: {
        employeeId: userId,
      },
      order: [["createdAt", "DESC"]], // order by init_time (latest first)
    });
    // Respond with the notifications
    res
      .status(200)
      .json(
        new ApiResponse(
          StatusCode.OK,
          notifications,
          "Notifications fetched successfully"
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

// api's
// expo push notification
// register a device for push notifications
const registerDevice = async (
  req: Request<
    {},
    {},
    {
      deviceToken: string;
    }
  >,
  res: Response
): Promise<void> => {
  const { deviceToken } = req.body;

  try {
    if (!deviceToken)
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Device Token is empty");

    const accessToken = getAccessToken(req);
    if (!accessToken)
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Token not found");

    const userId = verifyAccessToken(accessToken)?.userId!;
    const searchdUser = await Employee.findOne({
      where: { id: userId },
    });
    if (!searchdUser)
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "User not found");

    let device = await ExpoDeviceToken.findOne({
      where: { employeeId: userId },
    });

    if (device) {
      device.expoPushToken = deviceToken;
      await device.save();
    } else {
      device = await ExpoDeviceToken.create({
        employeeId: userId,
        expoPushToken: deviceToken,
      });
    }

    res
      .status(201)
      .json(
        new ApiResponse(
          StatusCode.CREATED,
          device.dataValues,
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

const expo = new Expo();
// send push Notification to an user

// send notification to an employee
const sendNotificationToEmployee = async (
  req: Request<
    {},
    {},
    {
      userId: string;
      title: string;
      body: string;
    }
  >,
  res: Response
): Promise<void> => {
  try {
    const { title, body, userId } = req.body;

    if (!title || !body || !userId) {
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "Title, body, and employeeId are required"
      );
    }

    const device = await ExpoDeviceToken.findOne({
      where: { employeeId: userId },
    });

    if (!device) {
      throw new ApiError(
        StatusCode.NOT_FOUND,
        {},
        "Expo device token not found"
      );
    }

    const tickets = await sendPushNotification(
      device.expoPushToken,
      title,
      body
    );

    res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(
          StatusCode.OK,
          tickets,
          "Notification sent successfully"
        )
      );
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json(error);
    } else {
      console.error("sendNotificationToEmployee error:", error);
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json(
          new ApiError(
            StatusCode.INTERNAL_SERVER_ERROR,
            {},
            "Failed to send notification"
          )
        );
    }
  }
};

// send notification to everyone in a server
const sendNotificationToServer = async (
  req: Request<
    {},
    {},
    {
      title: string;
      body: string;
    }
  >,
  res: Response
): Promise<void> => {
  try {
    const { title, body } = req.body;

    if (!title || !body) {
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "Missing serverId, title, or body"
      );
    }

    const accesToken = getAccessToken(req);
    const userId = verifyAccessToken(accesToken)?.userId;

    const searchUser = await Employee.findAll({ where: { id: userId } });
    if (!searchUser)
      throw new ApiError(StatusCode.NOT_FOUND, {}, "User not found.");

    const currentUserServer = await JoinedServer.findOne({
      where: { id: userId },
    });
    const serverId = currentUserServer?.serverId;
    if (!serverId) {
      throw new ApiError(StatusCode.NOT_FOUND, {}, "Server Id not found.");
    }
    // Step 1: Get all employees who joined the server
    const joined = await JoinedServer.findAll({
      where: { serverId },
    });

    const employeeIds = joined.map((entry) => entry.id);

    if (employeeIds.length === 0) {
      throw new ApiError(
        StatusCode.NOT_FOUND,
        {},
        "No users found for this server"
      );
    }

    // Step 2: Get their Expo device tokens
    const deviceTokens = await ExpoDeviceToken.findAll({
      where: { employeeId: employeeIds },
    });

    const messages = deviceTokens
      .filter((token) => Expo.isExpoPushToken(token.expoPushToken))
      .map((token) => ({
        to: token.expoPushToken,
        sound: "default",
        title,
        body,
        data: { serverId },
      }));

    if (messages.length === 0) {
      throw new ApiError(
        StatusCode.NOT_FOUND,
        {},
        "No valid Expo tokens found"
      );
    }

    // Step 3: Send notifications in chunks
    const chunks = expo.chunkPushNotifications(messages);
    const tickets: any[] = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (err) {
        console.error("Chunk sending error:", err);
      }
    }

    res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(
          StatusCode.OK,
          tickets,
          "Notification sent to all users in the server"
        )
      );
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json(error);
    } else {
      console.error("sendNotificationToServer error:", error);
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json(
          new ApiError(
            StatusCode.INTERNAL_SERVER_ERROR,
            {},
            "Something went wrong while sending the server notification"
          )
        );
    }
  }
};

// send notification to office
const sendNotificationToOffice = async (
  req: Request<
    {},
    {},
    {
      title: string;
      body: string;
      officeId: string;
    }
  >,
  res: Response
): Promise<void> => {
  try {
    const { title, body, officeId } = req.body;

    if (!title || !body || !officeId) {
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "Missing officeId, title, or body"
      );
    }

    const currentUserOffice = await JoinedOffice.findOne({
      where: { officeId: officeId },
    });
    if (!currentUserOffice) {
      throw new ApiError(StatusCode.NOT_FOUND, {}, "Server Id not found.");
    }
    // Step 1: Get all employees who joined the server
    const joined = await JoinedOffice.findAll({
      where: { officeId },
    });

    const employeeIds = joined.map((entry) => entry.id);

    if (employeeIds.length === 0) {
      throw new ApiError(
        StatusCode.NOT_FOUND,
        {},
        "No users found for this Office"
      );
    }

    // Step 2: Get their Expo device tokens
    const deviceTokens = await ExpoDeviceToken.findAll({
      where: { employeeId: employeeIds },
    });

    const messages = deviceTokens
      .filter((token) => Expo.isExpoPushToken(token.expoPushToken))
      .map((token) => ({
        to: token.expoPushToken,
        sound: "default",
        title,
        body,
        data: { officeId },
      }));

    if (messages.length === 0) {
      throw new ApiError(
        StatusCode.NOT_FOUND,
        {},
        "No valid Expo tokens found"
      );
    }

    // Step 3: Send notifications in chunks
    const chunks = expo.chunkPushNotifications(messages);
    const tickets: any[] = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (err) {
        console.error("Chunk sending error:", err);
      }
    }

    res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(
          StatusCode.OK,
          tickets,
          "Notification sent to all users in the office"
        )
      );
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json(error);
    } else {
      console.error("sendNotificationToServer error:", error);
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json(
          new ApiError(
            StatusCode.INTERNAL_SERVER_ERROR,
            {},
            "Something went wrong while sending the server notification"
          )
        );
    }
  }
};
// send notification to a certain selected people
const sendNotificationToSelectedUsers = async (
  req: Request<
    {},
    {},
    {
      userIds: string[]; // Array of employeeId values
      title: string;
      body: string;
    }
  >,
  res: Response
): Promise<void> => {
  try {
    const { userIds, title, body } = req.body;

    if (!userIds || userIds.length === 0 || !title || !body) {
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "Missing userIds, title or body"
      );
    }

    const deviceTokens = await ExpoDeviceToken.findAll({
      where: { employeeId: userIds },
    });

    const messages = deviceTokens
      .filter((token) => Expo.isExpoPushToken(token.expoPushToken))
      .map((token) => ({
        to: token.expoPushToken,
        sound: "default",
        title,
        body,
        data: { custom: "targeted-notification" },
      }));

    if (messages.length === 0) {
      throw new ApiError(
        StatusCode.NOT_FOUND,
        {},
        "No valid Expo tokens found for selected users"
      );
    }

    const chunks = expo.chunkPushNotifications(messages);
    const tickets: any[] = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (err) {
        console.error("Chunk sending error:", err);
      }
    }

    res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(
          StatusCode.OK,
          tickets,
          "Notification sent to selected users"
        )
      );
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json(error);
    } else {
      console.error("sendNotificationToSelectedUsers error:", error);
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json(
          new ApiError(
            StatusCode.INTERNAL_SERVER_ERROR,
            {},
            "Something went wrong while sending notifications"
          )
        );
    }
  }
};

export {
  registerDevice,
  sendNotificationToEmployee,
  sendNotificationToSelectedUsers,
  sendNotificationToServer,
  fetchAllNotifications,
  sendNotificationToOffice,
};
