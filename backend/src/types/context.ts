import { Request, Response } from "express";
import { IUser } from "./user";

export interface MyContext {
  user: IUser | null;
  res: Response;
  req: Request;
}
