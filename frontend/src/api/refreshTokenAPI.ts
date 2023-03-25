import { BASE_URL } from "../config/urls";

import { setCredentials } from "../features/auth/authSlice";
import store from "../app/store";

import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { REFRESH_TOKEN } from "../graphql/queries/authQueries";

export const refreshTokenAPI = async () => {
  try {
    const client = new ApolloClient({
      uri: `${BASE_URL}/graphql`,
      cache: new InMemoryCache(),
      // Enable sending cookies over cross-origin requests
      credentials: "include", //will work here since we are using uri instead of link option
      defaultOptions: {
        watchQuery: {
          fetchPolicy: "network-only", // Doesn't check cache before making a network request//always get token from the server
        },
      },
    });

    const { data, loading, error } = await client.query({
      query: REFRESH_TOKEN,
      //variables: { ... },
    });

    const {
      refresh: { accessToken },
    } = data;
    //update store with new token for subsequent queries
    store.dispatch(setCredentials(accessToken));

    return accessToken;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default refreshTokenAPI;
