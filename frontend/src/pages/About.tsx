import { gql, useQuery, useMutation, useLazyQuery } from "@apollo/client";
import { Box, Typography } from "@mui/material";
import React from "react";
import { REGISTER_USER } from "../graphql/mutations/userMutations";
import { GET_USER } from "../graphql/queries/userQueries";

const About = () => {
  const { loading, error, data } = useQuery(GET_USER, {
    onCompleted: (queryData)=>{//also available for useMutation// its is isSuccess equivalent
      //return queryData.getUser//transform response here
    },
    onError: (errData)=>{

    }
  });

  //useLAZYQUERY runs once on mount and again after variables changes=  refetch on param change eq in rtk query
  const [getUserData, { loading: xx, error:erx, data:ddx }] = useLazyQuery(GET_USER, {
    variables:{ 
      name: ""//pass var here//if it changes, query re-fetches
    },

    onCompleted: (queryData) => {
      //return queryData.getUser//transform response here
    },
    onError: (errData) => {},
  });

  //or 


  const [registerUser, { loading: load, error: err, data: da }] = useMutation(
    REGISTER_USER,
    {
      variables: { username: "alex", password: "1234", email: "12@gmail.com" },
      refetchQueries: [{query: GET_USER, variables:{id: ''}}], //re-fetches data
      //or update the cache
       //update cache with data of registerUser mutation
      update(cache, {data: {registerUser}}){
         //get user from cache//user from data returned by GET_USER query earlier
        const { user }: any = cache.readQuery({
          query: GET_USER
        });
        //update cache of data returned by GET_USER with the response of registerUser mutation
        cache.writeQuery({
          query: GET_USER,
          data: { user: user.push(registerUser) }, //eg also registerUser.id
        });
      }
    }
  );

  return (
    <Box my={4} alignSelf="center">
      {loading && <Typography>Loading...</Typography>}

      {error && <Typography>{error.message}</Typography>}

      {data && <Typography>{data.user.id.toString()}</Typography>}
      <Typography>Hello</Typography>
    </Box>
  );
};

export default About;
