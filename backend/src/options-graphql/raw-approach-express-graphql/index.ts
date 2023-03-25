
import express from "express";
const app = express();
import { graphqlHTTP } from "express-graphql";

import schema from "./schema/schema"

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: process.env.NODE_ENV === "development",
  })
);
