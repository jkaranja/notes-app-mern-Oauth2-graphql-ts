import * as user from "./user";

import * as note from "./note";

import * as auth from "./auth";

const resolvers = [user.resolvers, auth.resolvers, note.resolvers];
//merge type defs
const typeDefs = [user.typeDefs, auth.typeDefs, note.typeDefs];

export { resolvers, typeDefs };
