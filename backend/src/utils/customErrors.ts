import { GraphQLError } from "graphql";


//note, error code: 'UNAUTHORIZED' required on client to reauthorize//use this custom err instead of regular error
interface CustomError {
  message: string;
  code: string;
  // status: number;
}

//type for param is optional//as all props have default values= inferred types
//default is 401 authorization error
const customGraphqlError = ({
  code = "UNAUTHORIZED",
  message = "Not authorized",
}: Partial<CustomError>) => {
  return new GraphQLError(message, {
    extensions: {
      code,
      // http: { status },//don't add status option//client won't catch message
    },
  });
};

export default customGraphqlError;
