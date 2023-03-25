import { gql } from "apollo-server-express";

// Define our schema using the GraphQL schema language
//user type def
//uses tagged template literals// i.e gql will be called with the string and what is returned is value of typeDefs
//use template literals to concat strings
//each root type define root fields that each will have its corresponding resolver
export const userType = `
  type User {   
    id: String!
    username: String!
    email: String!
    password: String!
    isVerified: Boolean
    profileUrl: String!,
    phoneNumber: String!,
    newEmail: String!
  }

  type AccessToken {
    accessToken: String!
  }

  type Message {
    message: String!
  }

  #Queries

  type Query {
    user: User
  }

  #Mutations

  type Mutation {
    registerUser(username: String!, email: String!, password: String!): Message
    resendVerifyEmail: Message    
    updateUser(username: String!, email: String!, password: String!, phoneNumber: String!, newPassword: String!): User
    deleteUser: User
  }
`;
