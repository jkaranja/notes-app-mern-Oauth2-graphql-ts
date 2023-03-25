import { MyContext } from "../../types/context";
import * as userApi from "./data";

export const resolvers = {
  Query: {
    //parent, args, contextValue
    user: async (_: unknown, __: unknown, contextValue: MyContext) => {
      return await userApi.getUser(contextValue);
    },
  },

  Mutation: {
    registerUser: async (
      _: unknown,
      args: userApi.SignUpArgs,
      contextValue: MyContext
    ) => {
      return await userApi.registerUser(args, contextValue);
    },

    resendVerifyEmail: async (
      _: unknown,
      __: unknown,
      contextValue: MyContext
    ) => {
      return await userApi.resendVerifyEmail(contextValue);
    },

    updateUser: async (
      _: unknown,
      args: userApi.UpdateUserArgs,
      contextValue: MyContext
    ) => {
      return await userApi.updateUser(args, contextValue);
    },
    deleteUser: async (_: unknown, args: {id: string}, contextValue: MyContext) => {
      return await userApi.deleteUser(args.id, contextValue);
    },
  },
};
