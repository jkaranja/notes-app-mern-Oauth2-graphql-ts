import { format } from "date-fns";
import { v4 as uuid } from "uuid";
import fs from "fs";
import { promises as fsPromises } from "fs";

import path from "path";
import { RequestHandler } from "express";

//log events to file
const logEvents = async (message: string, logFileName: string) => {
  const dateTime = format(new Date(), "yyyyMMdd\tHH:mm:ss");
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

  try {
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
    }
    await fsPromises.appendFile(
      path.join(__dirname, "..", "logs", logFileName),
      logItem
    );
  } catch (err) {
    console.log(err);
  }
};

//plugin to log events + errs based on diff lifecycle events
const loggerPlugin = {
  // Fires whenever a GraphQL request is received from a client.
  async requestDidStart(requestContext: any) {
    //requestContext.request.query is the actual gql string as sent by client
    // logEvents(
    //   `Request started! Query:\t + ${requestContext.request.query}`,
    //   "reqLog.log"
    // );
    console.log("Request started! Query...");
    return {
      // Fires whenever Apollo Server will parse a GraphQL
      // request to create its associated document AST.
      async parsingDidStart() {
        //console.log('Parsing started!');
        return async (err: any) => {
          if (err) {
            console.error(err);
          }
        };
      },
      // Fires whenever Apollo Server will validate a
      // request's document AST against your GraphQL schema.
      async validationDidStart() {
        //console.log('Validation started!');
        // This end hook is unique in that it can receive an array of errors,
        // which will contain every validation error that occurred.
        return async (errs: any) => {
          if (errs) {
            errs.forEach((err: any) => console.error(err));
          }
        };
      },
      //any error during execution
      async executionDidStart() {
        return {
          //it is called after execution with any errors that occurred.
          async executionDidEnd(err: any) {
            if (err) {
              console.error(err);
              logEvents(`Error:\t${err}`, "errLog.log");
            }
          },
        };
      },
    };
  },
};


export default loggerPlugin;