import { useLazyQuery } from "@apollo/client";
import { Backdrop, CircularProgress } from "@mui/material";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { REFRESH_TOKEN } from "../../graphql/queries/authQueries";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import usePersist from "../../hooks/usePersist";


import { selectCurrentToken, setCredentials } from "./authSlice";

const RequireAuth = () => {
  const [persist] = usePersist();

  const [searchParams, setSearchParams] = useSearchParams();
  //set by oath success redirect//isAuthenticated = is a string since it is sent as query string
  const isAuthenticated = searchParams.get("authenticated");

  const dispatch = useAppDispatch();

  const [refresh, { loading: isLoading, error, data, called }] = useLazyQuery(
    REFRESH_TOKEN,
    {
      fetchPolicy: "network-only", //always fetch//don't use cache
      //will be called when no error occurred
      onCompleted: (data) => {
        //store token in store        
        dispatch(setCredentials(data.refresh.accessToken));
      },
    }
  );

  let content;

  const location = useLocation();

  const token = useSelector(selectCurrentToken);

  useEffect(() => {
    //fetch using refresh token in cookie and store access token in store
    //if error eg refresh has expired, go to login
    const getToken = async () => {
      await refresh();
    };
    if ((persist || isAuthenticated) && !token) getToken();
  }, []);

  if (isLoading) {
    content = (
      <Backdrop
        sx={{
          color: "#fff",
          bgcolor: "secondary.main",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  } else if (data && !error && !isLoading) {
    //no needed// isSuccess
    //after re-render due to state change// token=true below will catch this as well
    //allow protected access
    content = <Outlet />;
  } else if (error && !isLoading) {
    //login page//isError
    content = <Navigate to="/login" state={{ from: location }} replace />;
  } else if (token && !called) {
    //token: true & isUninitialized// handles !persist && token / persist && token
    //allow protected access
    content = <Outlet />;
  } else if (!persist && !isAuthenticated && !token) {
    //login page
    content = <Navigate to="/login" state={{ from: location }} replace />;
  }

  return content as JSX.Element;
};

export default RequireAuth;
