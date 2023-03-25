import fs from "fs";

import crypto from "crypto";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import { GraphQLError } from "graphql";
import bcrypt from "bcrypt";

import { Buffer } from "node:buffer";
import { RequestHandler } from "express";
import mongoose from "mongoose";
import { MyContext } from "../../types/context";
import User from "./User";
import sendEmail from "../../utils/sendEmail";
import customGraphqlError from "../../utils/customErrors";

//In GraphQL, it's recommended for every mutation's response to include the data that the mutation modified. This enables clients to obtain the latest persisted data without needing to send a followup query.
//https://www.apollographql.com/docs/apollo-server/schema/schema#designing-mutations

/*-----------------------------------------------------------
 * GET USER
 ------------------------------------------------------------*/
/**
 * @desc - Get user
 * @access - Private
 *
 */
const getUser = async ({ user }: MyContext) => {
  // optionally block the user
  // we could also check user roles/permissions here
  //user from contextValue param above
  // throwing a `GraphQLError` here allows us to specify an HTTP status code,
  // errors in graphql server initialization/schema validation/context code is 500
  //resolvers errors return 200 OK errors or success
  if (!user) {
     throw customGraphqlError({ code: "UNAUTHORIZED" });
  }

  return user;
};

/*-----------------------------------------------------------
 * REGISTER
 ------------------------------------------------------------*/

export interface SignUpArgs {
  username?: string;
  email?: string;
  password?: string;
}

/**
 * @desc - Create new user
 * @access - Public
 *
 */

const registerUser = async (args: SignUpArgs, { res }: MyContext) => {
  const { username, password, email } = args;

  // Confirm data
  if (!username || !email || !password) {
    throw new Error("All fields are required");
  }

  // Check for duplicate username || email
  //collation strength 2 makes username or email sent by user case insensitive i.e it should
  //match both lowercase and uppercase to ensure no same email is added in diff cases
  const duplicate = await User.findOne({ email })

    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    throw new Error("Account already exists. Please log in");
  }

  // Hash password
  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

  //gen verify token & hash it
  const verifyToken = crypto.randomBytes(10).toString("hex");
  const verifyEmailToken = crypto
    .createHash("sha256")
    .update(verifyToken)
    .digest("hex");

  //send verify token
  const emailOptions = {
    subject: "Please verify your email",
    to: email,
    body: `
                <p>Hi ${username}, </p>
                <p>Welcome to clientlance.io</p>
                <p>Please click the button below to confirm your email address:</p>             
                <a href ='${process.env.VERIFY_EMAIL_URL}/${verifyToken}' target='_blank' style='display: inline-block; color: #ffffff; background-color: #3498db; border: solid 1px #3498db; border-radius: 5px; box-sizing: border-box; cursor: pointer; text-decoration: none; font-size: 14px; font-weight: bold; margin: 15px 0px; padding: 5px 15px; text-transform: capitalize; border-color: #3498db;'>Confirm your email</a>  
                 
                <p>Thanks!</p>
                 <p>Clientlance team</p>
                             
                `,
  };
  //don't wait//they can resend if it fails
  const response = sendEmail(emailOptions);

  ///save user
  const userObject = {
    username,
    password: hashedPwd,
    email,
    verifyEmailToken,
  };

  const newUser = new User(userObject); //or use .create(obj)
  // Create /save new user
  const user = await newUser.save();

  if (!user) {
    throw new Error("Check details and try again");
  }

  //create a token that will be sent back as cookie//for resending email
  const resendEmailToken = jwt.sign(
    { id: user._id, email },
    process.env.RESEND_EMAIL_TOKEN_SECRET,
    { expiresIn: "15m" } //expires in 15 min
  );

  // Create secure cookie with user id in token
  res.cookie("resend", resendEmailToken, {
    httpOnly: false, //readable for displaying email
    secure: true,
    sameSite: "none", //
    maxAge: 15 * 60 * 1000, //expire in 15 min
  });

  return user; //return user
};

/*-----------------------------------------------------------
 * RESEND EMAIL
 ------------------------------------------------------------*/

/**
 * @desc - Resend email token
 * @access - Public
 *
 */
const resendVerifyEmail = async ({ req, res }: MyContext) => {
  const cookies = req.cookies;

  if (!cookies?.resend) {
    throw new Error("Email could not be sent");
  }

  const resendEmailToken: string = cookies.resend; //cookies.jwt is of any type//must be converted to string for err & decoded types to be inferred
  //else you must pass type: err: VerifyErrors | null,  decoded: JwtPayload | string | undefined

  const decoded = jwt.verify(
    resendEmailToken,
    process.env.RESEND_EMAIL_TOKEN_SECRET
  );

  const foundUser = await User.findById((<{ id: string }>decoded).id).exec();

  if (!foundUser) {
    throw new Error("Email could not be sent");
  }
  //now resend email with new verify token
  //gen verify token
  const verifyToken = crypto.randomBytes(10).toString("hex");
  const verifyEmailToken = crypto
    .createHash("sha256")
    .update(verifyToken)
    .digest("hex");

  //resend email
  const emailOptions = {
    subject: "Please verify your email",
    to: foundUser.email,
    body: `
                <p>Hi ${foundUser.username}, </p>
                <p>Welcome to clientlance.io</p>
                <p>Please click the button below to confirm your email address:</p>             
                <a href ='${process.env.VERIFY_EMAIL_URL}/${verifyToken}' target='_blank' style='display: inline-block; color: #ffffff; background-color: #3498db; border: solid 1px #3498db; border-radius: 5px; box-sizing: border-box; cursor: pointer; text-decoration: none; font-size: 14px; font-weight: bold; margin: 15px 0px; padding: 5px 15px; text-transform: capitalize; border-color: #3498db;'>Confirm your email</a>  
                 
                <p>Thanks!</p>
                 <p>Clientlance team</p>
                             
                `,
  };
  //don't wait//they can resend if it fails
  sendEmail(emailOptions);

  //update verify token
  foundUser.verifyEmailToken = verifyEmailToken;

  await foundUser.save();

  return { message: "Email sent" };
};

/*-----------------------------------------------------------
 * UPDATE/PATCH
 ------------------------------------------------------------*/
//ALLOW USERS TO CHANGE EMAIL BUT DON'T USE EMAIL AS UNIQUE IDENTIFY IN OTHER COLLECTION//USE user: object id //the can populate
//so you will only need to update email in user collection only//id remains the same

export interface UpdateUserArgs extends SignUpArgs {
  phoneNumber: string;
  newPassword: string;
  id: string;
  profileUrl: string;
  username: string;
  email: string;
}

/**
 * @desc - Update user
 * @access - Private
 *
 */
const updateUser = async (
  args: UpdateUserArgs,
  { user: userCtx }: MyContext
) => {
  if (!userCtx) {
     throw customGraphqlError({ code: "UNAUTHORIZED" });
  }

  const {
    username,
    email,
    phoneNumber,
    password,
    newPassword,
    id,
    profileUrl,
  } = args;

  //check if id is a valid ObjectId//ObjectIds is constructed only from 24 hex character strings
  if (!mongoose.isValidObjectId(id)) {
    throw new Error("User not found");
  }

  // Does the user exist to update//exists since we are already here
  const user = await User.findById(id).exec();

  if (!user) {
    throw new Error("User not found");
  }

  if (!password) {
    throw new Error("Password is required");
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw new Error("Wrong password");
  }

  // update user
  if (newPassword) user.password = await bcrypt.hash(newPassword, 10);
  if (username) user.username = username;
  if (phoneNumber) user.phoneNumber = phoneNumber;
  if (phoneNumber) user.profileUrl = profileUrl;

  //email changed
  if (email && user.email !== email) {
    //gen verify token & hash it
    const verifyToken = crypto.randomBytes(10).toString("hex");
    const verifyEmailToken = crypto
      .createHash("sha256")
      .update(verifyToken)
      .digest("hex");

    // Check for duplicate email//case insensitive
    const duplicate = await User.findOne({ email })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();

    // Allow only updates to the original user
    if (duplicate) {
      throw new Error("Duplicate email");
    }

    //update new email and token
    user.newEmail = email;
    user.verifyEmailToken = verifyEmailToken;

    //send un hashed token
    const emailOptions = {
      subject: "Please verify your email",
      to: email,
      body: `
                <p>Hi ${user.username}, </p>
                <p>Complete changing your email address by confirming it below:</p> 
                <a href ='${process.env.VERIFY_EMAIL_URL}/${verifyToken}' target='_blank' style='display: inline-block; color: #ffffff; background-color: #3498db; border: solid 1px #3498db; border-radius: 5px; box-sizing: border-box; cursor: pointer; text-decoration: none; font-size: 14px; font-weight: bold; margin: 15px 0px; padding: 5px 15px; text-transform: capitalize; border-color: #3498db;'>Confirm your email</a> 
                <p>If you didn't initiate this request, please disregard this email</p>
                <p>Thanks!</p>
                <p>Clientlance team</p>
                             
                `,
    };
    //wait for fail or success//can't resend email
    const response = await sendEmail(emailOptions);
    if (!response) {
      throw new Error("Account could not be updated. Please try again");
    }
  }

  const updatedUser = await user.save();

  if (!updatedUser) {
    throw new Error("Account could not be updated. Please try again");
  }

  //return  updated user details
  return updatedUser;
};

/**
 * @desc - Delete a user
 * @access - Private
 *
 */
const deleteUser = async (id: string, { res, user: userCtx }: MyContext) => {
  if (!userCtx) {
     throw customGraphqlError({ code: "UNAUTHORIZED" });
  }
  //check if id is a valid ObjectId//ObjectIds is constructed only from 24 hex character strings
  // if (!id.match(/^[0-9a-fA-F]{24}$/)) {
  //   throw new Error("User not found" });
  // }
  if (!mongoose.isValidObjectId(id)) {
    throw new Error("User not found");
  }

  // Does the user exist to delete?
  const user = await User.findById(id).exec();

  if (!user) {
    throw new Error("User not found");
  }

  await user.deleteOne();

  //clear refresh token cookie
  res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });

  return user; //on frontend, success = clear state and redirect to home
};

export { getUser, registerUser, updateUser, deleteUser, resendVerifyEmail };
