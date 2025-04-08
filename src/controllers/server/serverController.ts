import e, { Request, Response } from "express";
import ApiError from "../../utils/apiError";
import ApiResponse, { StatusCode } from "../../utils/apiResponse";
import Server from "../../models/serverModel";
import twilio from "twilio";

import { randomUUID } from "crypto";
import { verifyAccessToken } from "../../utils/jwtGenerater";
import JoinedServer from "../../models/joinedServerModel";
import {
  checkPassword,
  getAccessToken,
  validateEmail,
  validatePhoneNumber,
} from "../../utils/helper";
import { Employee, EmployeeStatus } from "../../models/employeeModel";
import { Roles } from "../../models/channelModel";
import sequelize from "../../config/db";

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

    const searchUser = await JoinedServer.findOne({ where: { id: ownerId } });
    if (searchUser) {
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "A user can have only one server at a time."
      );
    }

    const inviteCode = randomUUID().slice(0, 8);

    const newServer = await Server.create({
      name: serverName,
      idVerificationRequired,
      ownerId,
      inviteLink: inviteCode,
    });

    if (!newServer)
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Unable to create Server");

    res
      .status(201)
      .json(
        new ApiResponse(
          StatusCode.CREATED,
          newServer.dataValues,
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

const searchServer = async (
  req: Request<
    {},
    {},
    {},
    {
      inviteCode: string;
    }
  >,
  res: Response
): Promise<void> => {
  const { inviteCode } = req.query;

  try {
    if (!inviteCode)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { inviteId: "" },
        "Invide Code cannot be empty"
      );

    const searchedServer = await Server.findOne({
      where: { inviteLink: inviteCode },
    });
    if (!searchedServer)
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Server not found.");

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

const joinServer = async (
  req: Request<
    {},
    {},
    {},
    {
      inviteCode: string;
    }
  >,
  res: Response
): Promise<void> => {
  const { inviteCode } = req.query;
  const accessToken = getAccessToken(req);

  try {
    if (!inviteCode)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { inviteId: "" },
        "Invide Code cannot be empty"
      );

    const decoded = verifyAccessToken(accessToken);
    const userId = decoded?.userId;

    const searchedServer = await Server.findOne({
      where: { inviteLink: inviteCode },
    });
    if (!searchedServer)
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Server not found.");

    const searchUser = await JoinedServer.findOne({ where: { id: userId } });
    if (searchUser) {
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "A user can have only one server at a time."
      );
    }

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

// change the current server owner of a server.
export const changeServerOwnership = async (
  req: Request<
    {},
    {},
    {
      newOwnerId: string;
    }
  >,
  res: Response
): Promise<void> => {
  try {
    // get newOwnerId, password and accessToken from the request
    const { newOwnerId } = req.body;
    const password = req.headers["user-password"] as string;

    // verify & decode accessToken
    const validateAccessToken = verifyAccessToken(getAccessToken(req));

    if (!validateAccessToken)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "Access Token cannot be empty."
      );

    if (!newOwnerId || !password)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {
          newOwnerId: "",
          password: "",
          Detail: "Either of them is missing",
        },
        "newOwnerId or password cannot be empty"
      );

    const userId = validateAccessToken.userId;

    // search both user and server with the decode user id.

    const searchedServer = await Server.findOne({ where: { ownerId: userId } });
    const searchedUser = await Employee.findOne({ where: { id: userId } });
    if (!searchedServer)
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Server not found");

    if (!searchedUser)
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "User not found");

    if (searchedServer.ownerId !== searchedUser.id)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "Current User and Server Owner doesn't match"
      );

    // check if the password details are correct.
    const validatePassword = await checkPassword(
      password,
      searchedUser.password!
    );

    if (!validatePassword)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "User credencial not matched."
      );

    // Finally, Change and save the newOwnerId.
    searchedServer.ownerId = newOwnerId;
    const saved = searchedServer.save();

    if (!saved)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "Unable to Change the ownership"
      );

    res
      .status(201)
      .json(new ApiResponse(StatusCode.OK, {}, "Server Owner Changed"));
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

// Delete a server
export const deleteServer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // get newOwnerId, password and accessToken from the request
    const password = req.headers["user-password"] as string;

    // verify & decode accessToken
    const validateAccessToken = verifyAccessToken(getAccessToken(req));

    if (!validateAccessToken)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "Access Token cannot be empty."
      );

    const userId = validateAccessToken.userId;

    // search both user and server with the decode user id.

    const searchedServer = await Server.findOne({ where: { ownerId: userId } });
    const searchedUser = await Employee.findOne({ where: { id: userId } });
    if (!searchedServer)
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Server not found");

    if (!searchedUser)
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "User not found");

    if (searchedServer.ownerId !== searchedUser.id)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "Current User and Server Owner doesn't match"
      );

    // check if the password details are correct.
    const validatePassword = await checkPassword(
      password,
      searchedUser.password!
    );

    if (!validatePassword)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "User credencial not matched."
      );

    // Finally, delete the server.
    searchedServer.destroy();

    res
      .status(201)
      .json(new ApiResponse(StatusCode.OK, {}, "Server Deleted Successfully"));
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

// kick an employee from a server
export const kickEmployee = async (
  req: Request<
    {},
    {},
    {},
    {
      userId: string;
    }
  >,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.query;
    if (!userId)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { userId: "" },
        "userId cannot be empty"
      );

    const searchedUser = await JoinedServer.findOne({
      where: { id: userId },
    });

    if (!searchedUser)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "User not found in any server"
      );

    searchedUser.destroy();

    res
      .status(201)
      .json(
        new ApiResponse(
          StatusCode.CREATED,
          {},
          ` ${searchedUser.id} Kicked Successfully`
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

// leave a server
export const leaveServer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const accessToken = getAccessToken(req);
    if (!accessToken)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { userId: "" },
        "userId cannot be empty"
      );
    const userId = verifyAccessToken(accessToken)?.userId;

    const searchedUser = await Employee.findOne({
      where: { id: userId },
    });

    // search the user in the database.
    if (!searchedUser)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "User not found in any server"
      );

    // search server to see if the user is owner
    const searchedServer = await Server.findOne({
      where: { $ownerId$: userId },
    });

    if (searchedServer)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "An owner cannot leave a server."
      );

    await searchedUser.destroy();
    res
      .status(201)
      .json(
        new ApiResponse(
          StatusCode.CREATED,
          {},
          ` ${searchedUser} Kicked Successfully`
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

// Update users role
export const updateRole = async (
  req: Request<
    {},
    {},
    {},
    {
      userId: string;
      role: Roles;
    }
  >,
  res: Response
): Promise<void> => {
  try {
    const { userId, role } = req.query;

    if (!userId)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { userId: "" },
        "userId cannot be empty"
      );

    if (!role)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { userId: "" },
        "Role cannot be empty"
      );

    if (!Object.values(Roles).includes(role)) {
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { userId: "", possibleRoles: Roles },
        "The role is not valid"
      );
    }

    // search the user
    const searchedUser = await Employee.findOne({ where: { id: userId } });
    const token = getAccessToken(req);
    const currentUserRole = verifyAccessToken(token)?.role;

    if (
      currentUserRole?.toLocaleLowerCase() != Roles.ADMIN.toLocaleLowerCase()
    ) {
      console.log(currentUserRole);
      throw new ApiError(
        StatusCode.FORBIDDEN,
        {},
        "Sorry, You don't have enough permission"
      );
    }

    if (!searchedUser)
      throw new ApiError(StatusCode.NOT_FOUND, {}, "User not Found");
    searchedUser.role = role;
    const savedUser = searchedUser.save();

    if (!savedUser)
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Unable to save User");

    res
      .status(201)
      .json(
        new ApiResponse(
          StatusCode.CREATED,
          {},
          `${searchedUser.firstName}, is now a ${role}`
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

// edit employee details
// Employee wont be able to use these

interface EmployeeDetailsPayload {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  role: Roles;
  employmentStatus: EmployeeStatus;
}

export const updateEmployeeDetails = async (
  req: Request<{}, {}, EmployeeDetailsPayload>,
  res: Response
): Promise<void> => {
  try {
    const { id, firstName, lastName, phone, role, employmentStatus, email } =
      req.body;

    if (
      !id ||
      !firstName ||
      !lastName ||
      !phone ||
      role ||
      !employmentStatus ||
      !email
    )
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {
          id: "",
          firstName: "",
          lastName: "",
          phone: "",
          role: Roles,
          employeeStatus: EmployeeStatus,
          email: "",
        },
        "These field cannot be empty"
      );

    if (!Object.values(Roles).includes(role)) {
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { userId: "", possibleRoles: Roles },
        "The role is not valid"
      );
    }

    if (!Object.values(EmployeeStatus).includes(employmentStatus)) {
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        { employeeStatus: "", possibleStatus: EmployeeStatus },
        "The status is not valid"
      );
    }

    // search the user
    const searchedUser = await Employee.findOne({ where: { id: id } });

    if (!searchedUser)
      throw new ApiError(StatusCode.NOT_FOUND, {}, "User not Found");

    // Update fields if there are any changes
    let updated = false;
    if (searchedUser.firstName !== firstName) {
      searchedUser.firstName = firstName;
      updated = true;
    }

    if (searchedUser.lastName !== lastName) {
      searchedUser.lastName = lastName;
      updated = true;
    }

    if (searchedUser.phoneNumber !== phone) {
      searchedUser.phoneNumber = phone;
      updated = true;
    }
    if (searchedUser.email !== email) {
      searchedUser.email = email;
      updated = true;
    }

    if (searchedUser.role !== role) {
      searchedUser.role = role;
      updated = true;
    }

    if (searchedUser.employmentStatus !== employmentStatus) {
      searchedUser.employmentStatus = employmentStatus;
      updated = true;
    }
    if (updated) {
      const savedUser = await searchedUser.save();

      res
        .status(200)
        .json(
          new ApiResponse(
            StatusCode.OK,
            {},
            `${savedUser.firstName} is details has been updated.`
          )
        );
    } else {
      res
        .status(200)
        .json(new ApiResponse(StatusCode.OK, {}, "No changes were made"));
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

export const partialRegestrationEmployee = async (
  req: Request<{}, {}, EmployeeDetailsPayload, { serverId: string }>,
  res: Response
): Promise<void> => {
  const { firstName, lastName, phone, role, email } = req.body;
  const { serverId } = req.query;
  if (!serverId)
    throw new ApiError(StatusCode.BAD_REQUEST, {}, "Server Id cannot be empty");

  const t = await sequelize.transaction();
  try {
    // if any of these field is empty it will send a response of 404 error.
    if (!firstName || !lastName || !phone || !role || !email)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {
          id: "",
          firstName: "",
          lastName: "",
          phone: "",
          role: Roles,
          email: "",
        },
        "These field cannot be empty"
      );

    console.log(req.body);
    // this function check if the email is valid
    if (!validateEmail(email)) {
      throw new ApiError(400, {}, "Email is not valid");
    }

    // check if the phoneNumber is valid
    // Must start with +61, should be 12 characters long including countrycode.
    // currently supports only australia
    const isPhoneValid = validatePhoneNumber(phone);
    if (!isPhoneValid)
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Invalid Phone Number");

    // check if the user with this email already exists
    const checkUserEmail = await Employee.findOne({
      where: { email: email },
      transaction: t,
    });
    if (checkUserEmail != null) {
      throw new ApiError(StatusCode.CONFLICT, {}, "User already Registered");
    }

    // check if the user with this phone Number already exists
    const checkUserPhone = await Employee.findOne({
      where: { phoneNumber: phone },
      transaction: t,
    });
    if (checkUserPhone != null) {
      console.log(checkUserPhone);
      throw new ApiError(StatusCode.CONFLICT, {}, "Phone Number already used");
    }

    const searchServer = await Server.findOne({
      where: { id: serverId },
      transaction: t,
    });
    if (!searchServer)
      throw new ApiError(
        StatusCode.INTERNAL_SERVER_ERROR,
        {},
        "Server not found."
      );

    // create a user / employee
    const newUser = await Employee.create(
      {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phoneNumber: phone.toString(),
        role: "employee",
      },
      {
        transaction: t,
      }
    );

    const joinServer = await JoinedServer.create(
      {
        serverId: serverId,
        id: newUser.id,
      },
      {
        transaction: t,
      }
    );

    try {
      await sendTextPhone(
        phone,
        "Your employeer has added you to a server. Please complete regestration. You will require this phone number to complete regestration. Download out Mobile app today."
      );
    } catch (err) {
      throw new ApiError(
        StatusCode.INTERNAL_SERVER_ERROR,
        {},
        "Unable to send the SmS"
      );
    }

    if (!newUser || !joinServer)
      throw new ApiError(
        StatusCode.INTERNAL_SERVER_ERROR,
        {},
        "Failed to register User or join the server"
      );

    await t.commit();
    res.status(StatusCode.OK).json(
      new ApiResponse(
        StatusCode.OK,
        {
          firstName,
          lastName,
          email,
          phone,
        },
        "User registered"
      )
    );
    // search for current server
  } catch (error) {
    if (error instanceof ApiError)
      res
        .status(error.statusCode)
        .json(
          new ApiError(
            error.statusCode,
            error.error,
            error.message || "Something is not right"
          )
        );
    else {
      // Handle unexpected errors
      console.error(error); // Log the error for debugging
      res.status(500).json(new ApiError(500, error, "Internal Server Error"));
    }
    return;
  }
};

// get all users in a server and their roles
// --> access token needs to be passed via bearer token
const getAllUsersInServer = async (
  req: Request,
  res: Response
): Promise<void> => {
  const accessToken = getAccessToken(req);
  console.log(accessToken);
  try {
    if (!accessToken)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "Access Token cannot be empty."
      );

    const decoded = verifyAccessToken(accessToken);
    const userId = decoded?.userId;

    const joinedServer = await JoinedServer.findOne({
      where: { id: userId },
    });
    if (!joinedServer)
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Server Not found");

    // search for all users within that server
    const allUsers = await JoinedServer.findAll({
      where: {
        serverId: joinedServer.serverId,
      },
      include: [
        {
          model: Employee,
          attributes: {
            exclude: ["password"],
          },
        },
      ],
    });

    if (!allUsers)
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Users not found");

    res
      .status(201)
      .json(new ApiResponse(StatusCode.CREATED, allUsers, "Server found"));
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

// Send verification Code
export const sendTextPhone = async (
  toPhone: string,
  text: string
): Promise<void> => {
  // twilio details
  const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
  const authToken = process.env.TWILIO_AUTH_TOKEN || "";
  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || "";

  const client = twilio(accountSid, authToken);

  // Send SMS using Twilio
  const message = await client.messages.create({
    body: text,
    from: twilioPhoneNumber,
    to: toPhone,
  });

  if (!message) {
    throw new ApiError(500, {}, "Error sending Verification Code");
  }

  console.log("Sent Successfully", message.sid);

  console.log("OTP sent successfully:");
};

export {
  registerServer,
  getLoggedInUserServer,
  joinServer,
  searchServer,
  getAllUsersInServer,
};
