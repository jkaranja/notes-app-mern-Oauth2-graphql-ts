export const typeDefs = `#graphql
   

  type AccessToken {
    accessToken: String!
  }

  type Message {
    message: String!
  }

  #Queries

  type Query {
   refresh: AccessToken
   
  }

  #Mutations
  type Mutation {  
    login( email: String!, password: String!): AccessToken  
    verifyEmail(verifyToken: String!): Message
    oauthSuccess: AccessToken
    forgotPassword(email: String!): Message
    resetPassword(resetToken: String!, password: String!): Message
    logout: Message
  }
`;
