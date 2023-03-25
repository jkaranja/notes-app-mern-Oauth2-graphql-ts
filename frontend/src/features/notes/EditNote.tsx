import { Box, Button, Paper } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Intro from "../../components/Intro";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import showToast from "../../common/showToast";
import EditNoteForm from "./EditNoteForm";

import { useQuery } from "@apollo/client";
import { GET_NOTE } from "../../graphql/queries/noteQueries";

const EditNote = () => {
  const navigate = useNavigate();

  const location = useLocation();

  type TParams = { id: string };

  const { id } = useParams<TParams>();

  const noteId = parseInt(id!);

  

  const from = location.state?.from?.pathname || "/notes";

  //fetch query
  const {
    loading: isLoading,
    error,
    data,
  } = useQuery(GET_NOTE, {
    variables: {
      noteId,
    },
    fetchPolicy: "network-only", //fetch on mount//default is to not fetch if cache data exist
    //nextFetchPolicy: "cache-first", //then use cache after mount
    pollInterval: 15000, //15 secs
  });


  //feedback
  useEffect(() => {
    showToast({
      message: error?.message,
      isLoading,
      isError: Boolean(error),
      //isSuccess: Boolean(data),
    });
  }, [data, error, isLoading]);

  //edit form props
  const formProps = {
    noteId,
    note: data?.note,
  };

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        color="secondary"
        sx={{ fontWeight: "bold", mb: 2 }}
        onClick={() => navigate(from, { replace: true })}
      >
        Notes
      </Button>
      <Intro>Edit note</Intro>
      <Box component={Paper} p={4}>
        <EditNoteForm {...formProps} />
      </Box>
    </Box>
  );
};

export default EditNote;
