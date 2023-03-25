

//every field below will match the defined root type in typeDefs
//each root type has root field(s)//so each method/resolver below will match each root field in type Def
//the resolvers are responsible for getting the actual data for the fields

import { userMutations } from "./userMutations";
import { userQueries } from "./userQueries";

////each resolver has access to parent, args, context//args are values passed in query/context passed when apollo server is initialized

//every field below is a resolver i.e user resolvers
//the resolvers contain root types that have resolvers for each root field defined by type defs
export const userResolver = {
  //#Queries
  Query: userQueries,

  //#Mutations
  Mutation: userMutations,
};
