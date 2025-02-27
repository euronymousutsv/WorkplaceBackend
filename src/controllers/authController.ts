import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import ApiError from "../utils/ApiError";
import {
  checkPassword,
  validateEmail,
  validatePasswordSecurity,
  validatePhoneNumber,
} from "../utils/helper";
import ApiResponse, { StatusCode } from "../utils/ApiResponse";
import Employee from "../models/employeeModel";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwtGenerater";

// Define a interface for the request body
interface ReqUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export const registerUser = async (
  req: Request<{}, {}, ReqUserData>,
  res: Response
): Promise<void> => {
  const { firstName, lastName, email, password, phoneNumber } = req.body;
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
      where: { Email: email },
    });
    if (checkUserEmail != null) {
      throw new ApiError(StatusCode.CONFLICT, {}, "User already Registered");
    }

    // check if the user with this phone Number already exists
    const checkUserPhone = await Employee.findOne({
      where: { PhoneNumber: phoneNumber },
    });
    if (checkUserPhone != null) {
      console.log(checkUserPhone);
      throw new ApiError(StatusCode.CONFLICT, {}, "Phone Number already used");
    }

    // create a user / employee
    const newUser = Employee.create({
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      Password: hashedPassword,
      PhoneNumber: phoneNumber.toString(),
      EmploymentStatus: "Active",
      RoleID: 1,
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
      where: { Email: lowerCasedEmail },
    });

    if (!searchedUser) {
      throw new ApiError(StatusCode.UNAUTHORIZED, {}, "User Not Found");
    }

    // compare hashed password and the user input password for that user
    const isPasswordValid = await checkPassword(
      password,
      searchedUser.Password
    );

    if (!isPasswordValid) {
      throw new ApiError(StatusCode.UNAUTHORIZED, {}, "Invalid Credencials");
    }

    // if the password and hashed password match, then generate an access and refresh token

    const accessToken = generateAccessToken(
      searchedUser.EmployeeID.toString(),
      searchedUser.RoleID
    );

    // generate refresh token returns an array
    // storing that array into a new constant variable
    const genetated = generateRefreshToken(searchedUser.EmployeeID.toString());
    // refresh token is returned at index 0 & jti at 1.
    const refreshToken = genetated[0];

    // const jti = genetated[1];
    // a token table will be created to store a jti which will be used to validate a refresh token

    // const tokenTable = refreshToken.create({
    //   user: searchedUser,
    //   jti: jti,
    // });

    // tokenTable.save();

    // if (!tokenTable) {
    //   throw new ApiError(
    //     StatusCode.INTERNAL_SERVER_ERROR,
    //     {},
    //     "Unable to store token in the db."
    //   );
    // }

    res.status(StatusCode.OK).json(
      new ApiResponse(
        StatusCode.OK,
        {
          accessToken,
          refreshToken,
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
