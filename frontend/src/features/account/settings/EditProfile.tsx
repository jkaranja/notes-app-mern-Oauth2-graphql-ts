import { useMutation } from "@apollo/client";
import {
  Avatar,
  Box,
  Button,
  FormGroup,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import axios from "axios";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import showToast from "../../../common/showToast";
import { EMAIL_REGEX } from "../../../constants/regex";
import { UPDATE_USER } from "../../../graphql/mutations/userMutations";
import { User } from "../../../types/user";

import ConfirmPwd from "./ConfirmPwd";

const CLOUD_BASE_URL = "https://api.cloudinary.com/v1_1";
const API = axios.create({
  baseURL: CLOUD_BASE_URL,
  headers: {
    "Content-Type": "multipart/form-data", //default
  },
});

//NOTE: can't remove image from client for security reasons//send publicId of prev profile image along with update data to the server to remove this images using cloudinary node module//
//https://priyal-babel.medium.com/upload-and-delete-images-with-a-react-app-using-cloudinary-api-32565d11d760
//https://cloudinary.com/documentation/upload_images#uploading_with_a_direct_call_to_the_rest_api

const MEGA_BYTES_PER_BYTE = 1e6;
const convertBytesToMB = (bytes: number) =>
  Math.round(bytes / MEGA_BYTES_PER_BYTE);

type EditProfileProps = {
  user: User;
};

const EditProfile = ({ user }: EditProfileProps) => {
  const [selectedPic, setSelectedPic] = useState<File | null>(null);
  const [profileUrl, setProfileUrl] = useState("");
  const [picError, setPicError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  //dialog
  const [openD, setOpenD] = useState(false);
  const handleOpenD = () => {
    setOpenD(true);
  };
  const handleCloseD = () => {
    setOpenD(false);
  };
  //end of dialog

  type EditProfileInputs = Record<string, string> & {
    username: string;
    email: string;
    phoneNumber: string;
  };
  //a/c hook
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, submitCount },
    reset: resetForm,
  } = useForm<EditProfileInputs>();

  const [updateUser, { data, error, loading: isLoading }] =
    useMutation(UPDATE_USER);

  /**-----------------------------------------
   HANDLE PIC CHANGE
 --------------------------------------------*/
  //handle file change/set error
  const handlePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileType = ["image/jpeg", "image/png", "image/gif"];
    setPicError("");

    if (convertBytesToMB(e.target?.files?.[0]?.size || 0) > 5) {
      setPicError("File must be less than or equal to 5mb in size");
      return;
    }
    // if (!fileType.includes(e.target?.files[0]?.type)) {
    //   setPicError("Please Select an Image");
    //   return;
    // }
    setSelectedPic(e.target?.files?.[0]!);
  };

  /**-----------------------------------------
   IMAGE UPLOADER FN
 --------------------------------------------*/
  const uploadImage = async (image: Blob) => {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", import.meta.env.VITE_APP_PRESET_NAME);
    formData.append("cloud_name", import.meta.env.VITE_APP_CLOUD_NAME);
    formData.append("folder", "AUTH");
    try {
      const response = await API.post(
        `/${import.meta.env.VITE_APP_CLOUD_NAME}/image/upload`,
        formData
      );
      // console.log(response.data)//
      //{"public_id":"AUTH/uce33vvebsaacxixl3uk",
      //"url":"http://res.cloudinary.com/da4urrvxa/image/upload/v1679744164/AUTH/uce33vvebsaacxixl3uk.jpg","secure_url":"https://res.cloudinary.com/da4urrvxa/image/upload/v1679744164/AUTH/uce33vvebsaacxixl3uk.jpg","folder":"AUTH"}
      //extract public id from url on server for deleting image
      return response.data.secure_url;
    } catch (err) {
      if (axios.isAxiosError(err)) console.log(err.response?.data);
    }
  };

  /**--------------------------------
   HANDLE ACCOUNT SUBMIT
 -------------------------------------*/
  const onSubmitAccount = (password: string) => {
    return async (inputs: EditProfileInputs) => {
      try {
        setIsUploading(true)
        //upload file to cloudinary and store secure url if new image
        let profileUrl;
        if (selectedPic) {
          profileUrl = await uploadImage(selectedPic!);
        }

        setIsUploading(false);
        updateUser({
          variables: {
            ...inputs,
            id: user._id,
            password,
            profileUrl: profileUrl || user?.profileUrl,
          },
        });
      } catch (error) {
        setIsUploading(false);
        console.log(error);
      }
    };
  };

  //display selected pic in avatar
  useEffect(() => {
    if (!selectedPic) return;
    //option 1
    const objectUrl = URL.createObjectURL(selectedPic); //url rep a file object given
    setProfileUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedPic]);

//reset profile pic to user.profileUrl
const handlePicReset = () => {
  setPicError("");
  setProfileUrl(user?.profileUrl!);
};



  //set defaults
  useEffect(() => {
    resetForm({ ...user });
  }, [user]);

  /**----------------------------------------
   SHOW TOAST
 ---------------------------------------------*/
  //feedback
  useEffect(() => {

    
    showToast({
      message: error?.message || "Updated",
      isLoading: isLoading || isUploading,
      isError: Boolean(error),
      isSuccess: Boolean(data),
    });
  }, [data, error, isLoading, isUploading]);

  //dialog props
  const dialogProps = {
    open: openD,
    handleClose: handleCloseD,
    handleSubmit,
    onSubmit: onSubmitAccount,
  };

  return (
    <Box component={Paper} p={3}>
      <ConfirmPwd {...dialogProps} />
      <Typography variant="h6" gutterBottom mb={3}>
        Account
      </Typography>
      <Box sx={{ maxWidth: { md: "40vw" } }}>
        <form>
          <Grid2 container>
            <Grid2>
              <Avatar alt="profile" src={profileUrl || user?.profileUrl} />
            </Grid2>
            <Grid2>
              <Typography variant="h6" gutterBottom>
                <Button
                  color="secondary"
                  variant="outlined"
                  sx={{ mx: { md: 2 } }}
                  component="label"
                >
                  <input
                    hidden
                    accept="image/*"
                    multiple
                    type="file"
                    onChange={handlePicChange}
                  />
                  Upload new photo
                </Button>
                <Button
                  color="secondary"
                  onClick={handlePicReset}
                >
                  Reset
                </Button>
              </Typography>
              <Typography variant="caption" gutterBottom>
                Recommended dimensions: 200x200, maximum file size: 5MB
              </Typography>
              <Typography color="error.main" variant="caption" paragraph>
                {picError}
              </Typography>
            </Grid2>
          </Grid2>

          <FormGroup sx={{ mb: 0.5 }}>
            <TextField
              {...register("username", {
                required: "Username is required",
              })}
              InputLabelProps={{
                shrink: true,
              }}
              label="Username"
              margin="dense"
              color="secondary"
            />
            <Typography color="error.main" variant="caption">
              {errors.username?.message}
            </Typography>
          </FormGroup>
          <FormGroup sx={{ mb: 0.5 }}>
            <TextField
              {...register("phoneNumber", {
                required: "Phone number is required",
                // pattern: {value: PHONE_REGEX, message: ''},
              })}
              InputLabelProps={{
                shrink: true,
              }}
              label="Phone number"
              margin="dense"
              color="secondary"
            />
            <Typography color="error.main" variant="caption">
              {errors.phoneNumber?.message}
            </Typography>
          </FormGroup>

          <FormGroup sx={{ mb: 0.5 }}>
            <TextField
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: EMAIL_REGEX,
                  message: "Enter an email address",
                },
              })}
              InputLabelProps={{
                shrink: true,
              }}
              label="Email"
              margin="dense"
              color="secondary"
            />
            <Typography color="error.main" variant="caption">
              {errors.email?.message}
            </Typography>
            <Typography gutterBottom paragraph>
              <small>
                We’ll send a link to your new email address to complete the
                change.
              </small>
            </Typography>

            {user?.newEmail && (
              <Typography gutterBottom paragraph color="success.main">
                <small>
                  We sent a link to your email: {user.newEmail}. Click the link
                  to change email
                </small>
              </Typography>
            )}
          </FormGroup>

          <Button
            onClick={() => {
              !isValid && handleSubmit(() => {})();
              isValid && handleOpenD();
            }}
            color="secondary"
            variant="contained"
            disableElevation
            disabled={Boolean(picError)}
          >
            Save changes
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default EditProfile;
