import React, { useEffect, useState } from "react";

import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";

import { Card, CardContent, CardHeader } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";

import { useDispatch, useSelector } from "react-redux";


import { useMutation } from "@apollo/client";
import { VERIFY_EMAIL } from "../../graphql/mutations/authMutations";

const VerifyingEmail = () => {
  const navigate = useNavigate();

  const [verifyEmail, { data, error, loading: isLoading }] =
    useMutation(VERIFY_EMAIL);

  type TParams = { token: string };

  const { token } = useParams<TParams>();

  useEffect(() => {
    if (data || error || isLoading) return;

    const confirm = () => {
      verifyEmail({ variables: { verifyToken: token! } });
    };
    confirm();
  }, []);

  return (
    <Box sx={{ display: "flex" }} justifyContent="center">
      <Card sx={{ pt: 4, px: 2, pb: 2, minWidth: "450px" }}>
        <CardHeader
          title={
            <Box sx={{ display: "flex" }} justifyContent="center">
              {isLoading && (
                <CircularProgress size={45} color="inherit" thickness={2} />
              )}

              {data && (
                <Avatar sx={{ width: 45, height: 45, bgcolor: "success.main" }}>
                  {" "}
                  <CheckIcon />{" "}
                </Avatar>
              )}
              {error && (
                <Avatar sx={{ width: 45, height: 45, bgcolor: "error.main" }}>
                  {" "}
                  <ClearIcon />{" "}
                </Avatar>
              )}
            </Box>
          }
        />
        <CardContent>
          <Typography gutterBottom paragraph mb={5} align="center">
            {error?.message || data?.verifyEmail.message}
            {(isLoading as any) && "Loading..."}
          </Typography>

          {data && (
            <Button
              type="submit"
              size="large"
              variant="contained"
              fullWidth
              color="secondary"
              onClick={() => navigate("/notes")}
            >
              Proceed to account
            </Button>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default VerifyingEmail;
