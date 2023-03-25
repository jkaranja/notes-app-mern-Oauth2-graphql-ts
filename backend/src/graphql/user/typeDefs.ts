// @apollo/server 4 does not need the gql tag nor does it export it. //(apollo 3 used graphql-tag to export gql tag)
//since we are not using gql tag, we must use #graphql for syntax highlighting //Adding #graphql to the beginning of a template literal provides GraphQL syntax highlighting in supporting IDEs.

export const typeDefs = `#graphql
# Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  type User {
    _id: ID!
    username: String!
    email: String!    
    isVerified: Boolean
    profileUrl: String
    phoneNumber: String
    newEmail: String
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
    registerUser(username: String!, email: String!, password: String!): User!
    resendVerifyEmail: Message!
    updateUser(
      id: ID!
      username: String
      email: String
      password: String
      phoneNumber: String
      newPassword: String
      profileUrl: String
    ): User
    deleteUser(id: ID!): User!
  }
`;
