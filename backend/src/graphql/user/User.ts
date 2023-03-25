//this is the model
import mongoose, { InferSchemaType, model, Schema, Types } from "mongoose";
import { IUser } from "../../types/user";
// unique: true,//don't use unique//no custom error//creates extra index//check in controller
//note, type inference will add union string | undefined if no default or require property on a field


const userSchema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String },
    phoneNumber: { type: String },
    profileUrl: { type: String },
    roles: { type: [String], default: ["admin"] }, //arr of strings
    newEmail: { type: String },
    isVerified: { type: Boolean, default: false },
    verifyEmailToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordTokenExpiresAt: { type: Number },
  },
  { timestamps: true }
);

//type User = InferSchemaType<typeof userSchema>;
export default model<IUser>("User", userSchema);

