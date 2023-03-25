// // require("dotenv").config();
// import "dotenv/config";
// import "express-async-errors";
// import express from "express";
// import connectDB from "./config/dbConn";
// import path from "path";
// import errorHandler from "./middleware/errorHandler";
// import { logger, logEvents } from "./middleware/logger";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import corsOptions from "./config/corsOptions";
// import mongoose from "mongoose";
// import authRoutes from "./routes/authRoutes";
// import userRoutes from "./routes/userRoutes";
// import noteRoutes from "./routes/noteRoutes";
// import downloadRoutes from "./routes/downloadRoutes";
// import rootRoutes from "./routes/rootRoutes";
// import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";

// //load & run passport middleware(initialize + strategies) for Oauth2/SSO
// import "./config/passport";
// import { ApolloServer } from "apollo-server-express";

// import { typeDefs, resolvers } from "./schema/";
// import verifyJWT from "./middleware/authMiddleware";
// import { fileURLToPath } from "node:url";
// import makeDir from "make-dir";
// const UPLOAD_DIRECTORY_URL = require("./config/UPLOAD_DIRECTORY_URL");

// //const { graphqlUploadExpress } = require("graphql-upload");

// //import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";

// const { graphqlUploadExpress } = require("graphql-upload");
// //import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";

// const app = express();

// const PORT = process.env.PORT || 4000; //avoid 5000//used by other services eg linkedin passport
// connectDB();

// //GUIDE TO MIGRATE TO APOLLO 4/apollo-server-express is deprecated
// //https://www.apollographql.com/docs/apollo-server/migration

// //Initialize apollo server & pass it to instance of express server//
// //IIFE or use startApolloServer = ()=>{}
// (async () => {
//   // Ensure the upload directory exists.
//   // Ensure the upload directory exists.
//   await makeDir(UPLOAD_DIRECTORY_URL);

//   // Required logic for uploading files (multipart-requests) with Express
//   // For more on multipart-requests, refer to https://github.com/jaydenseric/graphql-multipart-request-spec#server
//   app.use(
//     graphqlUploadExpress({
//       maxFileSize: 10000000, // 10 MB
//       maxFiles: 20,
//     })
//   );

//   //using apollo server express- to connect graphql to express server, write type definitions/schema and resolvers
//   //we also apply graphql as middleware to instance of express/server
//   //create an instance of apollo server and pass our typeDefs + resolvers
//   const server = new ApolloServer({
//     typeDefs,
//     resolvers,
//     //context will be available as resolvers 3rd param
//     context: ({ req, res }: any) => ({ req, res }), //you can also add user to context ({user: req.user, req, res})
//     //enable Graphql Playground(a interactive script tool for testing query, typeDefs and mutations, it also list available schema and other useful information)
//     //at http://localhost:4000/graphql//else you will be redirected you use remote playground or sandbox
//     plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
//   });

//   //log req events
//   app.use(logger);
//   //parse data/cookie
//   app.use(express.json());
//   app.use(express.urlencoded({ extended: true }));
//   app.use(cookieParser());
//   //allow cross origin requests//other origins to req our api//leave black to allow all
//   //corsOptions= {
//   //   origin: ["http://localhost:3050"], //can be an array or function for dynamic origins like below
//   //   credentials: true, //allow setting of cookies etc
//   //  optionsSuccessStatus: 200;
//   // }
//   //if no origin configured, it allows all origins
//   app.use(cors(corsOptions));

//   //auth middleware
//   app.use(verifyJWT);

//   /*-----------------------------------------
//  * SERVE STATIC FILES i.e css, images or js files eg files in public or build folder
//  ---------------------------*-------------*/
//   app.use("/", express.static(path.join(__dirname, "public")));
//   //or app.use(express.static("public"));// = 'public' means ./public

//   /*-----------------------------------------
//  * GRAPHQL ROUTE/
//  ----------------------------------------*/
//   //await apollo server to start
//   await server.start();
//   //pass the instance of apollo server to express server
//   server.applyMiddleware({
//     app, // By default, apollo-server hosts its GraphQL endpoint at the
//     // server root. However, *other* Apollo Server packages host it at
//     // /graphql. Optionally provide this to match apollo-server.
//     //path: '/',  //default is '/graphql' eg : http://localhost:4000/graphql
//   });

//   app.use("/api/auth", authRoutes);

//   app.use("/api/users", userRoutes);

//   app.use("/api/notes", noteRoutes);

//   app.use("/api/download", downloadRoutes);
//   /*-----------------------------------------
//  * GENERAL ROUTES
//  ---------------------------*-------------*/
//   //---------API HOME/INDEX PAGE ROUTE--------
//   app.use("/", rootRoutes);

//   //---------API 404 PAGE----------------
//   //app works same as .use but go thru all http verbs
//   //TS is able to infer types of req, and res since we passed the route path
//   app.all("*", (req, res) => {
//     res.status(404);
//     /**check accept header to determine response //accept html else json */
//     if (req.accepts(".html")) {
//       res.sendFile(path.join(__dirname, "views", "404.html"));
//     } else if (req.accepts("json")) {
//       res.json({ message: "404 Not Found" });
//     } else {
//       res.type("txt").send("404 Not Found");
//     }
//   });

//   /*-----------------------------------------
//  * ERROR HANDLER//MUST BE THE LAST MIDDLEWARE
//  ---------------------------*-------------*/
//   app.use(errorHandler);

//   /*-----------------------------------------
//  * RUN SERVER AND OPEN CONNECTION TO DB
//  ---------------------------*-------------*/

//   //run server only when db is connected
//   mongoose.connection.once("open", () => {
//     console.log("Connected to MongoDB");
//     app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

//     console.log(
//       `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
//     );
//   });
//   //log db connection errors
//   mongoose.connection.on("error", (err) => {
//     console.log(err);
//     logEvents(
//       `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
//       "mongoErrLog.log"
//     );
//   });
// })();
