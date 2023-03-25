//each resolver has access to parent, args, context//args are values passed in query/context passed when apollo server is initialized
export const userQueries = {
  user(_: any, args: any, context: any) {
    return {
      id: "2333333",
      username: "mark",
      email: "xyz@gmail.com",
      password: "1234",
      isVerified: false,
    };
  },

  
};
