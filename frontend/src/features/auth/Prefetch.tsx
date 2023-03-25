import { useLazyQuery, useQuery } from "@apollo/client";
import React from "react";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import store from "../../app/store";
import client from "../../config/apolloClient";
import { GET_NOTES } from "../../graphql/queries/noteQueries";

const Prefetch = () => {



  //for now, not needed since notes are set to 'network-only' in noteList to always fetch on mount
  const [notes, { loading: isLoading, data, error, }] = useLazyQuery(
    GET_NOTES,
    {
      variables: {
        page: 1,
        size: 10,
        endDate: "",
        startDate: "",
        searchTerm: "",
      },
      fetchPolicy: "network-only", //fetch on mount//default is to not fetch if cache data exist
      //nextFetchPolicy: "cache-first", //then use cache after mount
      // pollInterval: 15000, //15 secs
      notifyOnNetworkStatusChange: true, //if using refetch or fetchMore to update loading and re-render
    }
  );

  //prefetch once on mount
  useEffect(() => {
    notes();

    //or not using query hooks
    // client.query({
    //   query: GET_NOTES,
    //   variables: { ...queryArgs },
    // });
  }, []);

  return <Outlet />;
};

export default Prefetch;
