import { enGB } from "date-fns/locale";
import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
  GraphQLEnumType,
} from "graphql";
import { clients, projects } from "../sampleData";

//WE WILL ONLY USE GRAPHQL + EXPRESS GRAPHQL

//THIS IS THE RAW APPROACH I.E WITH LOW LEVEL TYPE EXPRESSIONS LIKE GraphQLString
//RESOLVERS AND TYPE DEFINITIONS ARE COMBINED TOGETHER
//THE SCHEMA EXPORTED AT THE BOTTOM IS THEM PASSED TO EXPRESS-GRAPHQL AND THAT IS ALL

//ANOTHER OPTION IS USING query language definition I.E SEPARATE RESOLVERS FROM TYPE DEFINITIONS
//ref: https://itnext.io/building-your-first-graphql-server-d5c4f88f5e82

//gql is a query language for api i.e help us query or req the exact data that we need
//when a req comes, all root fields will be loaded and resolvers attached to their respective root fields will be executed async
// each result from the resolvers is returned and only what was specified as the payload of the query will be returned

//schema is a collection of graphql types(root types + scalars(String, Boolean, Int, Float), enum, object types)
//it defines the fields and their types for which client can query or request data

// Client Type--> type that can be used with a root field
//this will define the structure of the data the root field will return if this type was passed as a type to that field

const ClientType = new GraphQLObjectType({
  name: "Client",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
  }),
});

// Project Type//another root field type with a one2one relation//can also be used as a root type
//the root field type can also contain data

const ProjectType = new GraphQLObjectType({
  name: "Project",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    status: { type: GraphQLString },
    client: {
      type: ClientType,
      resolve(parent, args) {
        return clients.find((client) => client.id === parent.clientId);
      },
    },
  }),
});

/**--------------------------------------------------------------------------------------
 * //root types/Query type(query,mutation and subscriptions) 
 ------------------------------------------------------------------------------*/
//these are the entry points for the requests sent by the client
//they are simply the same as any other GraphQL object type, and their fields work exactly the same way.

//While query fields are executed in parallel, mutation fields run in series, one after the other.

//1. QUERY TYPE TO HANDLE QUERIES/FETCHING
//query type-->the root type for handling queries for defined root fields//each field is like a route in rest api
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    //define all our root fields(each has a resolver called at runtime) for queries
    //get client y id
    client: {
      type: ClientType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return clients.find((client) => client.id === args.id);
      },
    },
    //get all clients
    clients: {
      type: new GraphQLList(ClientType),
      resolve(parent, args) {
        return clients;
      },
    },

    projects: {
      type: new GraphQLList(ProjectType),
      resolve(parent, args) {
        return projects;
      },
    },
    project: {
      type: ProjectType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return projects.find((project) => project.id === args.id);
      },
    },
  },
});

//putting all root types and their root fields together to form one schema(collection of graphql types)
//this will expose our graphql service to api calls via an endpoint: '/graphql'
//our graphql schema now needs a graphql server, in our case express. To connect graphql to express, you can use express-graphql(connect it with a middleware..see in server) or Apollo Server

//writing queries eg on graphiQL

//option1: with query, you can omit operation type and operation name//shorthand//starts with curly braces
// query {//you can omit query keyword
//   projects{
//     name
//     description
//     id
//     client{
//       id
//       name
//     }

//   }

// }

//option2: with operation name
//query getProjects{
//   projects{
//     name
//     description
//     id
//     client{
//       id
//       name
//     }

//   }

// }

//passing args//
//Note: can't use variables as args using the shorthand syntax i.e no operation name
//option1: directly
// {
//   projects(id: "2"){
//     name
//     description
//     id
//     client{
//       id
//       name
//     }

//   }
//   }

//option2: with variables//must use operation name
//the ! next to ID! means id in the variable object is not optional//but must must the server type definition as well
// query getProject($id: ID!){ //declare your var and give it a valid type//can also have default value eg $id: ID ="3"  & you can call query without variables
// project(id: $id){//pass var as arg//must pass all declared var above to args here//else not used err
//   name
//   description
//   id
//   client{
//     id
//     name
//   }

// }
// }

//find the variable section and pass variable as a json//if no ! in definition, this optional
// eg:
// {
//   "id": "3"
// }

//with default value
// query getProject($id: ID = "2"){
//   project(id: $id){
//     name
//     description
//     id
//     client{
//       id
//       name
//     }

//   }
//   }

// Mutations
const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    // Add a client
    addClient: {
      type: ClientType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLNonNull(GraphQLString) },
        phone: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, args) {
        clients.push(args as any);

        return clients.pop();
      },
    },
  },
});

//writing mutations eg on graphiQL

// mutation{
//   addClient(name: "mark", phone: "072022", email: "x@gmail.com"){
//     name
//     id
//     email
//   }
//   }

//or with name

// mutation addClient{
//   addClient(name: "mark", phone: "072022", email: "x@gmail.com"){
//     name
//     id
//     email
//   }
//   }

////;can also use variables //must add ! as non-nullable fields
// mutation addClient($name: String!, $phone: String!, $email: String!){
//   addClient(name: $name, phone: $phone, email: $email){
//     name
//     id
//     email
//   }
//   }

//then variables:
//   {
//   "name": "mark",
//   "phone": "072022",
//   "email": "x@gmail.com"
// }

export default new GraphQLSchema({
  query: RootQuery,
  mutation,
});
