import { MyContext } from "../../types/context";
import * as authApi from "./data";

export const resolvers = {
  //parent, args, contextValue
  Query: {
    refresh: async (_: unknown, __: unknown, contextValue: MyContext) => {
      return await authApi.refresh(contextValue);
    },
  },

  Mutation: {
    login: async (
      _: unknown,
      args: authApi.LoginArgs,
      contextValue: MyContext
    ) => {
      return await authApi.login(args, contextValue);
    },

    verifyEmail: async (
      _: unknown,
      args: authApi.VerifyEmailArgs,
      contextValue: MyContext
    ) => {
      return await authApi.verifyEmail(args, contextValue);
    },

    oauthSuccess: async (_: unknown, __: unknown, contextValue: MyContext) => {
      return await authApi.oauthSuccess(contextValue);
    },

    forgotPassword: async (
      _: unknown,
      args: authApi.forgotPasswordArgs,
      contextValue: MyContext
    ) => {
      return await authApi.forgotPassword(args, contextValue);
    },

    resetPassword: async (
      _: unknown,
      args: authApi.ResetPasswordArgs,
      contextValue: MyContext
    ) => {
      return await authApi.resetPassword(args, contextValue);
    },

    logout: async (_: unknown, __: unknown, contextValue: MyContext) => {
      return await authApi.logout(contextValue);
    },
  },
};
