import bcrypt from "bcrypt";
import ApiError from "./apiError.js";
import { StatusCode } from "./apiResponse.js";

/**
 * Checks if the hashed password matches the provided plain-text password.
 *
 * This function uses bcrypt to compare the hashed password with the plain-text password.
 *
 * @param {string} plainPassword - The plain-text password to compare.
 * @param {string} hashedPassword - The hashed password to check against.
 * @returns {Promise<boolean>} A promise that resolves to true if the passwords match, otherwise false.
 */
export function checkPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Checks whether the provided email is valid.
 *
 * A valid email must match the following criteria:
 * - Contains exactly one "@" symbol.
 * - Has a domain name that includes at least one "." after the "@".
 * - The local part (before the "@") can include letters, numbers, and certain special characters.
 *
 * @param {string} email - The email address to check.
 * @returns {boolean} True if the email is valid, otherwise false.
 */

export const validateEmail = (email: string): boolean => {
  const emailPattern =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailPattern.test(email.toLocaleLowerCase());
};

/**
 * Checks if the password is secure.
 *
 * A secure password must:
 * - Be longer than 8 characters.
 * - Contain at least 1 number.
 * - Contain at least 1 capital letter.
 * - Contain at least 1 small letter.
 * - Contain at least 1 symbol.
 *
 * @param {string} password - The password to check.
 * @returns {boolean} True if the password is secure, otherwise false.
 */
export function validatePasswordSecurity(password: string): boolean {
  let hasCapitalLetter: boolean = false;
  let hasSmallLetter: boolean = false;
  let hasNumber: boolean = false;
  let hasSymbol: boolean = false;

  for (let i = 0; i < password.length; i++) {
    const char: string = password[i];

    // Check for capital letters
    if (/[A-Z]/.test(char)) {
      hasCapitalLetter = true;
    }
    // Check for small letters
    else if (/[a-z]/.test(char)) {
      hasSmallLetter = true;
    }
    // Check for numbers
    else if (/[0-9]/.test(char)) {
      hasNumber = true;
    }
    // Check for symbols (non-alphanumeric characters)
    else {
      hasSymbol = true;
    }
  }

  if (
    hasCapitalLetter &&
    hasCapitalLetter &&
    hasNumber &&
    hasSmallLetter &&
    hasSymbol &&
    password.length >= 8
  )
    return true;
  else return false;
}

/**
 * Checks if the number is valid or not
 * @param {number} phone - the phonenumber which whill be checked
 * @returns {number} a number which doesn't have noth "0" or "61" in front
 * @throws {ApiError} if the number is not 9 characters.
 *
 */

// Functon to validate a number - > Note it doesnt veryfy a number it just checks if the number passed is supposed to be a valid phone number.
export function validatePhoneNumber(phoneNumer: string): boolean {
  if (!phoneNumer.startsWith("+61")) {
    return false;
  }

  if (phoneNumer.length != 12) return false;
  const newNum = Number.parseInt(phoneNumer.slice(0));
  console.log(newNum);
  if (!isNaN(newNum)) return true;
  else return false;
}
