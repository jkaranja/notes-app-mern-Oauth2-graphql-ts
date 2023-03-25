import { Request } from "express";
import jwt from "jsonwebtoken";
import User from "../graphql/user/User";

import { IUser } from "../types/user";

/**
 * @desc user context
 * @param req
 * @returns User | null
 */
const verifyJWT = async (req: Request): Promise<IUser | null> => {
  const authHeader =
    (req.headers.authorization as string) ||
    (req.headers.Authorization as string);

    //fail fast//no token in header or invalid
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  try {
    //executed synchronously if no callback
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById((<{ id: string }>decoded).id)
      .select("-password")
      .lean()
      .exec();
    //null or user
    return user;

  } catch (error) {
    //catch jwt + async errors
    // console.error(
    //   "Forbidden: " + (error as { message: string })!.message
    // );

    return null;
  }
};

export default verifyJWT;
