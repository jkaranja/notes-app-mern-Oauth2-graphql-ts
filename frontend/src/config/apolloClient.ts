import { BASE_URL } from "./urls";

import { setContext } from "@apollo/client/link/context";

import {
  ApolloClient,
  HttpLink,
  ApolloLink,
  InMemoryCache,
  concat,
  createHttpLink,
  from,
} from "@apollo/client";

import { onError } from "@apollo/client/link/error";

import { RetryLink } from "@apollo/client/link/retry";
import { useEffect, useState } from "react";
import { authState } from "../context/Context";
import store from "../app/store";
import refreshTokenAPI from "../api/refreshTokenAPI";

//The Apollo Link library gives you fine-grained control of HTTP requests that are sent by Apollo Client.
//you define network behavior as a collection of link objects that execute in sequence to control the flow of data.

//Apollo Client uses Apollo Link's HttpLink to send GraphQL operations to a server over HTTP.//which you can customize/not necessary
const httpLink = new HttpLink({
  uri: `${BASE_URL}/graphql`,
  credentials: "include", //must be added here for cookie to work//will be set but not stored in browser if not set here when using link option instead of uri
});
//option 2 using createHttpLink
// const httpLink = createHttpLink({
//   uri: `${BASE_URL}/graphql`,
//   credentials: "include",
// });

//

//option1: Adding custom link that adds an Authorization header to every HTTP request before the HttpLink sends it:
// const authMiddleware = new ApolloLink((operation, forward) => {
//   // add the authorization to the headers
//   operation.setContext(({ headers = {} }) => ({
//     headers: {
//       ...headers,
//       authorization: localStorage.getItem("token") || null,
//     },
//   }));

//   return forward(operation);
// });

//option2: using setContext instead that is passed to HttpLink internally
//The setContext function accepts a function that returns either an object or a promise, which then returns an object to set the new context of a request. the cb receives (request, previousContext)
// It receives two arguments: the GraphQL request being executed, and the previous context.
//unlike onError, this function will wait for promise to settle b4 forwarding req to next link in chain
//so we use this to refetch the token if onError returned 401
const authLink = setContext((_: unknown, { headers }: any) => {
  //get current token from store
  const currentAccessToken = store.getState().auth.token;
  //retry: onError sets this header if 401, then passes context to here, we modify the header with a new token
  if (headers?.isUnauthorized) {
    //here we will return a promise that returns an object
    return refreshTokenAPI().then((newAccessToken) => {
      return {
        // return the headers to the context so httpLink can read them
        headers: {
          ...headers,
          authorization: newAccessToken && `Bearer ${newAccessToken}`,
        },
      };
    });
  }

  //first try: //attach token in store to headers//we return an object
  return {
    // return the headers to the context so httpLink can read them
    headers: {
      ...headers,
      authorization: currentAccessToken && `Bearer ${currentAccessToken}`,
    },
  };
});

//retry type 1: On GraphQL errors retry link//any err not returned by graphql under error.graphQLErrors
//this same link can handle retry for both network and graphql errors. Recommended is to use RetryLink for network errors
//The onError link can retry a failed operation based on the type of GraphQL error that's returned.
//onError for 401 graphql error: intercept response if 401 error--access token expired, re-authorize, and retry the initial request
//unfortunately, you can't perform any async operations inside the onError cb//so can't get new token from server
//the response will return before the promise returns token(but retry operation will work fine)//no good feedback
//so below, we intercept response, check for 401, set isUnauthorized to true//and forward req to authLink to get a new token and set the headers
const reauthLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      for (let err of graphQLErrors) {
        //loop through graphql errors array and match Unauthorized error code
        switch (err.extensions.code) {
          // Apollo Server sets code to UNAUTHORIZED
          // when an AuthorizationError is thrown in a resolver
          case "UNAUTHORIZED":
            //get oldHeaders//if not passing a cb to setContext
            //const oldHeaders = operation.getContext().headers;
            // add the authorization to the headers
            //modify headers & retry only after getting the new token
            // add the authorization to the headers
            operation.setContext(({ headers = {} }) => ({
              headers: {
                ...headers,
                authorization: localStorage.getItem("token") || null, //this will be overridden by authLink during retry//this would work if our token is not coming from server
                isUnauthorized: true, //will be used in authLink to check if prev req returned 401
              },
            }));

            // Retry the request, returning the new observable
            //If your retried operation also results in errors, those errors are not passed to your onError link to prevent an infinite loop of operations. This means that an onError link can retry a particular operation only once.
            return forward(operation);
        }
      }
    }

    // To retry on network errors, we recommend adding a RetryLink to your link chain.
    // instead of the onError link. This just logs the error.
    if (networkError) {
      console.log(`[Network error]: ${networkError}`);
    }
    //or if (networkError.statusCode === 401) logout();
  }
);

//Retry type 2: on network errors retry link
//catch any error under error.networkError//error added by apollo client
//These are network errors encountered while attempting to communicate with your GraphQL server
//used where you would rather wait longer than explicitly fail an operation.
//applicable when dealing with unreliable communication/internet
const retryLink = new RetryLink({
  delay: {
    initial: 300, //number of milliseconds to wait before attempting the first retry.//the delay of each subsequent retry is multiplied by 2 each time.
    max: Infinity, //The maximum number of milliseconds that the link should wait for any retry.
    jitter: true, //Whether delays between attempts should be randomized./delays are randomized anywhere between 0ms (instant), and 2x the configured delay.
  },
  attempts: {
    max: 2, //max number of times to try a single operation before giving up.//default is 5
    retryIf: (error, _operation) => !!error, //predicate function that can determine whether a particular response should be retried
  },
});

//initialize apollo client
const client = new ApolloClient({
  cache: new InMemoryCache(),
  //links order below is important//reauthLink --> authLink-->...-->httpLink(must be last)
  link: from([reauthLink, authLink, retryLink, httpLink]), //or using concat method, link: authLink.concat(other, httpLink]),
  // Enable sending cookies over cross-origin requests
  //credentials: "include", // 'same-origin' is default i.e sends only if same origin//won't work if link is used instead of uri//add this in HttpLink constructor instead
  //uri: `${BASE_URL}/graphql`,//replaced by link above to allow multiple links//use this if not adding custom req logic
});

//ref
//remove warning in console when updating cache
// const cache = new InMemoryCache({
//   typePolicies:{
//     Query: {
//       fields:{
//         //user field
//         user: {
//           merge(existing, incoming){
//             return incoming
//           }
//         }
//         //...add other query fields
//       }
//     }
//   }
// });

//const httpLink = createHttpLink({
//   uri: `${BASE_URL}/graphql`,
// credentials: "same-origin",
// });

export default client;
