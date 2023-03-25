

//here, we will use apollo-server-express for server + build schema for type defs and create resolvers
//we will then combine them using graph-tool to form a schema that will be passed to apollo-server-express
//ref:
//https://blog.pusher.com/handling-authentication-in-graphql-jwt/
//ref2//separate concerns: https://itnext.io/building-your-first-graphql-server-d5c4f88f5e82


// const { makeExecutableSchema } = require("graphql-tools");
// const resolvers = require("./resolvers");

// // Define our schema using the GraphQL schema language
// const typeDefs = `
//       type User {
//         id: Int!
//         username: String!
//         email: String!
//       }

//       type Query {
//         me: User
//       }

//       type Mutation {
//         signup (username: String!, email: String!, password: String!): String
//         login (email: String!, password: String!): String
//       }
//     `;
// module.exports = makeExecutableSchema({ typeDefs, resolvers });