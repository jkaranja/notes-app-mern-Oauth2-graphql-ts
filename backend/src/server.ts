import "dotenv/config";
import "express-async-errors";
import express from "express";
import connectDB from "./config/dbConn";
import path from "path";
//import errorHandler from "./middleware/errorHandler";
import { logger, logEvents } from "./middleware/logger";
import cors from "cors";
import cookieParser from "cookie-parser";
import corsOptions from "./config/corsOptions";
import mongoose from "mongoose";
import { expressMiddleware } from "@apollo/server/express4";
import rootRoutes from "./routes/rootRoutes";

import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import http from "http";
//load & run passport middleware(initialize + strategies) for Oauth2/SSO
//import "./config/passport";

import { ApolloServer } from "@apollo/server";

import { typeDefs, resolvers } from "./graphql/schema";
import { MyContext } from "./types/context";
import verifyJWT from "./utils/verifyJWT";
import loggerPlugin from "./utils/loggerPlugin";

const PORT = process.env.PORT || 4000; //avoid 5000//used by other services eg linkedin passport
connectDB();

//Initialize apollo server & pass it to instance of express server//
//IIFE or use startApolloServer = ()=>{}
(async () => {
  // Required logic for integrating with Express
  const app = express();

  // Our httpServer handles incoming requests to our Express app.
  // Below, we tell Apollo Server to "drain" this httpServer,
  // enabling our servers to shut down gracefully.
  const httpServer = http.createServer(app);

  //using apollo server express- to connect graphql to express server, write type definitions/schema and resolvers
  //we also apply graphql as middleware to instance of express/server
  //create an instance of apollo server and pass our typeDefs + resolvers
  //plus playground(instead of online sandbox) + the drain plugin for our httpServer.
  const server = new ApolloServer<MyContext>({
    typeDefs,
    resolvers,

    //No plugin for playground. Uses default Graphql Playground(a interactive script tool for testing query, typeDefs and mutations, it also list available schema and other useful information)
    //at http://localhost:4000/graphql// you will be redirected you use remote playground or sandbox
    plugins: [loggerPlugin, ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  // Note you must call `server.start()` on the `ApolloServer`
  // instance before passing the instance to `expressMiddleware`
  // Ensure we wait for our server to start
  await server.start();

  //log req events
  //app.use(logger);//see loggerPlugin//logs events for diff req lifecycle events/phase
  //parse data/cookie
  app.use(express.json()); //required by graphql
  app.use(express.urlencoded({ extended: true }));
  /* Parse cookie header and populate req.cookies */
  app.use(cookieParser());
  //allow cross origin requests//other origins to req our api//leave black to allow all
  //required by graphql
  app.use(cors(corsOptions));

  /*-----------------------------------------
 * SERVE STATIC FILES i.e css, images or js files eg files in public or build folder
 ---------------------------*-------------*/
  app.use("/", express.static(path.join(__dirname, "public")));
  //or app.use(express.static("public"));// = 'public' means ./public

  /*-----------------------------------------
 * GRAPHQL ROUTE/
 ----------------------------------------*/
  //our expressMiddleware function.
  //Specify the path where we'd like to mount our server
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        // Try to retrieve a user with the token//user | null//private pages must have a user = token//inb resolvers
        const user = await verifyJWT(req);
        // Add the user to the context
        return { user, res, req };
      },
    })
  );

  /*-----------------------------------------
 * ROOT + 404 ROUTES
 ---------------------------*-------------*/
  //---------API HOME/INDEX PAGE ROUTE--------
  app.use("/", rootRoutes);

  //---------API 404 PAGE----------------
  //app works same as .use but go thru all http verbs
  //TS is able to infer types of req, and res since we passed the route path
  app.all("*", (req, res) => {
    res.status(404);
    /**check accept header to determine response //accept html else json */
    if (req.accepts(".html")) {
      res.sendFile(path.join(__dirname, "views", "404.html"));
    } else if (req.accepts("json")) {
      res.json({ message: "404 Not Found" });
    } else {
      res.type("txt").send("404 Not Found");
    }
  });

  /*-----------------------------------------
 * ERROR HANDLER//MUST BE THE LAST MIDDLEWARE
 ---------------------------*-------------*/
  //app.use(errorHandler);
  //apollo server catches all graphql errors(both synchronous and (asynchronous errors in resolvers))
  //eg of errors: syntax errors, validation errors(eg field don't exist or of wrong type), resolver errors/eg async errors

  /*-----------------------------------------
 * RUN SERVER AND OPEN CONNECTION TO DB
 ---------------------------*-------------*/
  //run server only when db is connected
  mongoose.connection.once("open", () => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () =>
      console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`)
    );
  });
  //log db connection errors
  mongoose.connection.on("error", (err) => {
    console.log(err);
    logEvents(
      `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
      "mongoErrLog.log"
    );
  });
})();
