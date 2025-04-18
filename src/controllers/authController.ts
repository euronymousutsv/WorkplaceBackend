import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import twilio from "twilio";
import {
  checkPassword,
  getAccessToken,
  validateEmail,
  validatePasswordSecurity,
  validatePhoneNumber,
} from "../utils/helper";
import ApiResponse, { StatusCode } from "../utils/apiResponse";
import { Employee, EmployeeStatus } from "../models/employeeModel";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
} from "../utils/jwtGenerater";
import { randomBytes } from "crypto";
import NodeCache from "node-cache";
import { RefreshToken } from "../models/refreshModel";
import ApiError from "../utils/apiError";
import sequelize from "../config/db";
import { EmployeeDetails } from "../models/employeeDetails";

// Define a interface for the request body
interface ReqUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  userName: string;
  role: "admin" | "employee" | "manager";
  baseRate: string;
  contractHours?: string;
  employeeType: "full-time" | "part-time" | "casual";
  department: string;
  position: string;
  managerId?: string;
  hireDate: Date;
}

// this will hold the verification code for 5 mins for each user.
// which will then be deleted automatically.
const otpCache = new NodeCache({ stdTTL: 300 });
const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
const authToken = process.env.TWILIO_AUTH_TOKEN || "";
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || "";

export const registerUser = async (
  req: Request<{}, {}, ReqUserData>,
  res: Response
): Promise<void> => {
  const {
    
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
  
  } = req.body;
  const t = await sequelize.transaction();
  try {
    // if any of these field is empty it will send a response of 404 error.
    if (!email || !password || !firstName || !lastName || !phoneNumber) {
      throw new ApiError(
        400,
        {},
        "Please make sure all field have values on them"
      );
    }

    // this function check if the email is valid
    if (!validateEmail(email)) {
      throw new ApiError(400, {}, "Email is not valid");
    }

    // checks password length and if it is strong
    if (!validatePasswordSecurity(password)) {
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "Password is not secured enough. See if it has at least 8 characters and at lease one capital letter, small letter, symbol and a number"
      );
    }

    // This variable will store the hashed password which will then be sent to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // check if the phoneNumber is valid
    // Must start with +61, should be 12 characters long including countrycode.
    // currently supports only australia
    const isPhoneValid = validatePhoneNumber(phoneNumber);
    if (!isPhoneValid)
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Invalid Phone Number");

    // check if the user with this email already exists
    const checkUserEmail = await Employee.findOne({
      where: { email: email },
    });
    if (checkUserEmail != null) {
      throw new ApiError(StatusCode.CONFLICT, {}, "User already Registered");
    }

    // check if the user with this phone Number already exists
    const checkUserPhone = await Employee.findOne({
      where: { phoneNumber: phoneNumber },
    });
    if (checkUserPhone != null) {
      console.log(checkUserPhone);
      throw new ApiError(StatusCode.CONFLICT, {}, "Phone Number already used");
    }

    // create a user / employee
    const newUser = await Employee.create({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword,
      phoneNumber: phoneNumber.toString(),
      employmentStatus: EmployeeStatus.INACTIVE,
      role: "employee",
      
    });
 

    const savedUser = (await newUser).save();
    if (!savedUser)
      throw new ApiError(
        StatusCode.INTERNAL_SERVER_ERROR,
        {},
        "Failed to register User"
      );
  } catch (error) {
    if (error instanceof ApiError)
      res
        .status(error.statusCode)
        .json(
          new ApiError(
            error.statusCode,
            {},
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
  res.status(StatusCode.OK).json(
    new ApiResponse(StatusCode.OK, {
      firstName,
      lastName,
      email,
      phoneNumber,
    })
  );
};

export const loginUser = async (
  req: Request<{}, {}, { email: string; password: string }>,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;
  // check if the email is an valid email
  try {
    if (!email || !password) {
      // returns true only when the email is a valid email
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "Email or password cannot be empty!"
      );
    }
    const lowerCasedEmail = email.toLowerCase();

    if (lowerCasedEmail) {
      // returns true only when the email is a valid email
      if (!validateEmail(lowerCasedEmail)) {
        throw new ApiError(
          StatusCode.BAD_REQUEST,
          {},
          "Input email is not valid"
        );
      }
    }

    // search for the user using email in the database
    const searchedUser = await Employee.findOne({
      where: { email: lowerCasedEmail },
    });

    if (!searchedUser) {
      throw new ApiError(StatusCode.UNAUTHORIZED, {}, "User Not Found");
    }

    if (!searchedUser.password) {
      throw new ApiError(
        StatusCode.CONFLICT,
        {},
        "User registration not complete."
      );
    }

    // compare hashed password and the user input password for that user
    const isPasswordValid = await checkPassword(
      password,
      searchedUser.password!
    );

    if (!isPasswordValid) {
      throw new ApiError(StatusCode.UNAUTHORIZED, {}, "Invalid Credencials");
    }

    // if the password and hashed password match, then generate an access and refresh token

    const accessToken = generateAccessToken(
      searchedUser.id.toString(),
      searchedUser.role
    );

    // generate refresh token returns an array
    // storing that array into a new constant variable
    const genetated = generateRefreshToken(searchedUser.id.toString());
    // refresh token is returned at index 0 & jti at 1.
    const refreshToken = genetated[0];

    const jti = genetated[1];
    // a token table will be created to store a jti which will be used to validate a refresh token

    const searchedToken = await RefreshToken.findOne({
      where: { employeeId: searchedUser.id },
    });
    if (searchedToken) {
      await searchedToken.destroy();
    }

    const tokenTable = await RefreshToken.create({
      employeeId: searchedUser.id,
      jti: jti,
    });

    if (!tokenTable) {
      throw new ApiError(
        StatusCode.INTERNAL_SERVER_ERROR,
        {},
        "Unable to store token in the db."
      );
    }

    res.status(StatusCode.OK).json(
      new ApiResponse(
        StatusCode.OK,
        {
          accessToken,
          refreshToken,
          profileImage: searchedUser.profileImage,
          name: searchedUser.firstName,
        },
        "User Logged In Successfully"
      )
    );
  } catch (error) {
    if (error instanceof ApiError)
      res
        .status(error.statusCode)
        .json(
          new ApiError(
            error.statusCode,
            {},
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

export const partialRegestrationPasswordSet = async (
  req: Request<{}, {}, { password: string; phoneNumber: string }>,
  res: Response
): Promise<void> => {
  try {
    const { password, phoneNumber } = req.body;
    console.log(password, phoneNumber);

    if (!password || !phoneNumber)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "Missing password or PhoneNumber."
      );

    // checks password length and if it is strong
    if (!validatePasswordSecurity(password)) {
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "Password is not secured enough. See if it has at least 8 characters and at lease one capital letter, small letter, symbol and a number"
      );
    }
    const searchedUser = await Employee.findOne({
      where: { phoneNumber: phoneNumber },
    });

    if (!searchedUser)
      throw new ApiError(StatusCode.NOT_FOUND, {}, "User not found");

    if (searchedUser.password != null)
      throw new ApiError(
        StatusCode.CONFLICT,
        {},
        "The user has already been registerd."
      );
    // This variable will store the hashed password which will then be sent to the database
    const hashedPassword = await bcrypt.hash(password, 10);
    searchedUser.password = hashedPassword;
    searchedUser.employmentStatus = EmployeeStatus.ACTIVE;
    const saved = await searchedUser.save();

    if (!saved) throw new ApiError(StatusCode.NOT_FOUND, {}, "Unable to save");
    res
      .status(StatusCode.OK)
      .json(new ApiResponse(StatusCode.OK, {}, "User regestration complete"));
  } catch (error) {
    if (error instanceof ApiError) res.status(error.statusCode).json(error);
    else {
      // Handle unexpected errors
      console.error(error); // Log the error for debugging
      res.status(500).json(new ApiError(500, error, "Internal Server Error"));
    }
    return;
  }
};

// this will validate the code
export const validateVerificationCode = async (
  req: Request<{}, {}, { code: string; phoneNumber: string }>,
  res: Response
): Promise<void> => {
  try {
    const { code, phoneNumber } = req.body;

    if (!code || !phoneNumber)
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "Missing verification code or Phone."
      );
    const savedCode: string = otpCache.get(phoneNumber) || "";
    console.log(savedCode);

    if (savedCode.toLowerCase() !== code.toLowerCase())
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "Incorrect Verification Code."
      );
    else {
      otpCache.del(phoneNumber);
      res
        .status(StatusCode.OK)
        .json(new ApiResponse(StatusCode.OK, {}, "Verified successfully"));
    }
  } catch (error) {
    if (error instanceof ApiError) res.status(error.statusCode).json(error);
    else {
      // Handle unexpected errors
      console.error(error); // Log the error for debugging
      res.status(500).json(new ApiError(500, error, "Internal Server Error"));
    }
    return;
  }
};

enum PersonalInfoEnum {
  FULLNAME = "fullName",
  LASTNAME = "lastName",
  PHONE = "phone",
  PROFILEIMAGE = "profileImage",
  PASSWORD = "password",
}

// function to edit current user name, and other details
export const editCurrentUserDetail = async (
  req: Request<
    {},
    {},
    { password: string; editType: PersonalInfoEnum; newDetail: string }
  >,
  res: Response
) => {
  const token = getAccessToken(req);
  const { password, editType, newDetail } = req.body;
  try {
    if (!token) {
      throw new ApiError(StatusCode.UNAUTHORIZED, {}, "Missing Token.");
    }
    if (!editType || !newDetail) {
      throw new ApiError(
        StatusCode.BAD_REQUEST,
        {},
        "Missing, What field do you want to update?"
      );
    }
    if (!Object.values(PersonalInfoEnum).includes(editType)) {
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Invalid Edit Type");
    }

    if (!password) {
      throw new ApiError(StatusCode.BAD_REQUEST, {}, "Missing Password");
    }

    const decodedToken = verifyAccessToken(token || "");

    if (!decodedToken)
      throw new ApiError(StatusCode.UNAUTHORIZED, {}, "Access token Expired.");

    const user = await Employee.findOne({
      where: { id: decodedToken?.userId },
    });

    if (!user) throw new ApiError(StatusCode.NOT_FOUND, {}, "User not found");
    const verifyPassword = await checkPassword(password, user?.password || "");

    if (!verifyPassword) {
      throw new ApiError(StatusCode.UNAUTHORIZED, {}, "Incorrect Credencial");
    }

    switch (editType) {
      case PersonalInfoEnum.FULLNAME:
        const name = newDetail.split(" ");

        if (user.firstName == name[0] && user.lastName == name[1]) {
          throw new ApiError(
            StatusCode.UNAUTHORIZED,
            {},
            "Same details cannot be changed."
          );
        }
        if (user.firstName != name[0]) {
          user.firstName = name[0];
        }
        if (user.lastName != name[1]) {
          user.lastName = name[1];
        }
        const savedUser = await user.save();

        if (!savedUser) {
          throw new ApiError(
            StatusCode.BAD_GATEWAY,
            {},
            "Something went wring while saving this information."
          );
        }
        break;

      case PersonalInfoEnum.PASSWORD:
        const hashedPassword = await bcrypt.hash(newDetail, 10);
        user.password = hashedPassword;
        const passSavedUser = await user.save();
        if (!passSavedUser) {
          throw new ApiError(
            StatusCode.BAD_GATEWAY,
            {},
            "Something went wring while saving this information."
          );
        }
        break;

      case PersonalInfoEnum.PHONE:
        const validPhone = validatePhoneNumber(newDetail);
        if (!validPhone) {
          throw new ApiError(
            StatusCode.BAD_REQUEST,
            {},
            "Phone Number is not valid"
          );
        }
        user.phoneNumber = newDetail;
        const phoneSavedUser = await user.save();
        if (!phoneSavedUser) {
          throw new ApiError(
            StatusCode.BAD_GATEWAY,
            {},
            "Something went wrong while saving this information."
          );
        }
        break;
    }

    res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(StatusCode.OK, editType + " changed successfully.")
      );
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json(error);
    } else {
      res
        .status(StatusCode.BAD_REQUEST)
        .json(
          new ApiError(
            StatusCode.BAD_REQUEST,
            error,
            "Something went wrong while fetching user info"
          )
        );
    }
  }
};

// function to get current user details
export const getCurrentUserDetails = async (req: Request, res: Response) => {
  const token = getAccessToken(req);
  try {
    const decodedToken = verifyAccessToken(token || "");

    if (!decodedToken)
      throw new ApiError(StatusCode.UNAUTHORIZED, {}, "Access token Expired.");

    const user = await Employee.findOne({
      where: { id: decodedToken?.userId },
    });

    if (!user)
      throw new ApiError(StatusCode.UNAUTHORIZED, {}, "User not found");
    else {
      const { password, ...userWithoutPassword } = user.dataValues;
      res
        .status(StatusCode.OK)
        .json(
          new ApiResponse(
            StatusCode.OK,
            userWithoutPassword,
            "Successfully fetcted user data"
          )
        );
    }
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json(error);
    } else {
      res
        .status(StatusCode.BAD_REQUEST)
        .json(
          new ApiError(
            StatusCode.BAD_REQUEST,
            error,
            "SOmething went wrong when fetching user info"
          )
        );
    }
  }
};

export const verificationCode = async (
  req: Request<{}, {}, { phoneNumber: string }>,
  res: Response
): Promise<void> => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      throw new ApiError(400, {}, "Phone Number is required!");
    }
    const valid = validatePhoneNumber(phoneNumber);
    if (!valid) throw new ApiError(400, {}, "Invalid Phone Number");
    // Ensure email is provided

    const client = twilio(accountSid, authToken);

    // Generate a 6-character verification code
    const generateVerificationCode = (): string =>
      randomBytes(3).toString("hex").toUpperCase().slice(0, 6);

    // Send verification Code
    const sendVerificationPhone = async (toPhone: string): Promise<void> => {
      const verificationCode = generateVerificationCode();

      // Send SMS using Twilio
      const message = await client.messages.create({
        body: `Your verification code is: ${verificationCode}`,
        from: twilioPhoneNumber,
        to: phoneNumber,
      });

      if (!message) {
        throw new ApiError(500, {}, "Error sending Verification Code");
      }

      console.log("OTP sent successfully:", message.sid);

      const cacheSuccess = otpCache.set(phoneNumber, verificationCode);
      console.log(phoneNumber);

      if (!cacheSuccess) {
        throw new ApiError(500, {}, "Error storing Verification Code");
      }

      console.log("OTP sent successfully:");
    };
    sendVerificationPhone(phoneNumber);

    res.status(200).json(new ApiResponse(200, {}, "OTP sent successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json(error);
    } else {
      res.status(500).json({ success: false, error: "Failed to send OTP" });
    }
  }
};

export const logOutUSer = async (
  req: Request<{}, {}, {}>,
  res: Response
): Promise<void> => {
  try {
    const accessToken = getAccessToken(req);
    const isAuthorized = verifyAccessToken(accessToken);

    if (!isAuthorized) {
      throw new ApiError(
        StatusCode.UNAUTHORIZED,
        {},
        "Invalid or Expired token"
      );
    }

    const userId = isAuthorized.userId;
    const searchedUserToken = await RefreshToken.findOne({
      where: { employeeId: userId },
    });

    if (!searchedUserToken) {
      throw new ApiError(StatusCode.NOT_FOUND, {}, "Token Not Found");
    }
    searchedUserToken.destroy();

    res.status(200).json(new ApiResponse(200, {}, "Logged out Successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json(error);
    } else {
      res.status(500).json({ success: false, error: "Failed to logout." });
    }
  }
};
