import { useMutation } from "@apollo/client";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Typography,
} from "@mui/material";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import showToast from "../../../common/showToast";
import { DELETE_USER } from "../../../graphql/mutations/userMutations";
import { User } from "../../../types/user";

import ConfirmPwd from "./ConfirmPwd";

type DeleteAccountProps = {
  user: User;
};

const DeleteAccount = ({ user }: DeleteAccountProps) => {
  const [deleteAc, setDeleteAc] = useState(true);

  //dialog
  const [openD, setOpenD] = useState(false);
  const handleOpenD = () => {
    setOpenD(true);
  };
  const handleCloseD = () => {
    setOpenD(false);
  };
  //end of dialog

  const [deleteUser, { data, error, loading: isLoading }] =
    useMutation(DELETE_USER);

  /**--------------------------------------
   HANDLE DELETE A/C
 ------------------------------------------*/
  const handleAccountDelete = (cb: any) => {
    return cb();
  };
  const onSubmitDelete = (password: string) => {
    return async () => {
      await deleteUser({ variables: { id: user._id } });
    };
  };

  //feedback
  useEffect(() => {
    showToast({
      message: error?.message || "Deleted",
      isLoading,
      isError: Boolean(error),
      isSuccess: Boolean(data),
    });
  }, [data, error, isLoading]);

  //dialog props
  const dialogProps = {
    user,
    open: openD,
    handleClose: handleCloseD,
    handleSubmit: handleAccountDelete,
    onSubmit: onSubmitDelete,
  };

  return (
    <Box component={Paper} p={3} mt={3}>
      <ConfirmPwd {...dialogProps} />
      <Typography variant="h6">Delete account</Typography>
      <Typography variant="caption" gutterBottom>
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              color="secondary"
              checked={deleteAc}
              onChange={() => setDeleteAc((prev) => !prev)}
            />
          }
          label="I confirm my account deactivation"
        />
      </Typography>
      <Typography pt={2} gutterBottom>
        <Button
          color="error"
          variant="contained"
          disableElevation
          disabled={!deleteAc}
          onClick={handleOpenD}
        >
          Delete account
        </Button>
      </Typography>
    </Box>
  );
};

export default DeleteAccount;
