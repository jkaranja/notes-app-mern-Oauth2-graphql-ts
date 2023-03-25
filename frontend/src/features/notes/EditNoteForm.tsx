import { useMutation } from "@apollo/client";
import {
  Box,
  Button,
  FormGroup,
  FormLabel,
  TextField,
  Typography,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import React, { useEffect } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import convertBytesToKB from "../../common/convertBytesToKB";
import showToast from "../../common/showToast";
import DatePicker from "../../components/DatePicker";
import Dropzone from "../../components/Dropzone";
import { UPDATE_NOTE } from "../../graphql/mutations/noteMutations";
import { Note, NoteFile } from "../../types/note";

interface EditNoteFormProps {
  note: Note;
  noteId: number;
}

const EditNoteForm = ({ note, noteId }: EditNoteFormProps) => {
 
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | number>(new Date());

  const [removedFiles, setRemovedFiles] = useState<NoteFile[]>([]);
  const [currentFiles, setCurrentFiles] = useState<NoteFile[]>([]);

  interface NoteInputs extends Record<string, string> {
    title: string;
    content: string;
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset: resetForm,
  } = useForm<NoteInputs>();

  //update mutation

  const [updateNote, { data, error, loading: isLoading }] =
    useMutation(UPDATE_NOTE);

  /* ----------------------------------------
   REMOVE FILES
   ----------------------------------------*/
  const handleRemove = (path: string) => {
    const removed = currentFiles.filter((file: NoteFile) => file.path === path);

    setRemovedFiles((prev: NoteFile[]) => [...prev, ...removed]);

    setCurrentFiles((prev) => {
      return prev.filter((file: NoteFile) => file.path !== path);
    });
  };

  /* ----------------------------------------
   UPDATE NOTE
   ----------------------------------------*/
  ///submit note form
  const onSubmitNote = (inputs: NoteInputs) => {
    if (!selectedDate) return null;

    updateNote({
      variables: {
        ...inputs,
        noteId,
        files: "",
        deadline: (selectedDate as Date).toISOString(),
      },
    });
  };

  //set defaults
  useEffect(() => {
    resetForm({ title: note?.title, content: note?.content });
   // setCurrentFiles(note?.files);
    setSelectedFiles([]);

    setRemovedFiles([]);
    //setSelectedDate(format(new Date(data.deadline.toISOString()), "dd/MM/yyyy h:mm aa"));//not working
    setSelectedDate(new Date(note?.deadline).getTime()); //use .getTime() to pass as number//as date or iso string not working
  }, [note]);

 
  //feedback
  useEffect(() => {
    showToast({
      message: error?.message || "Note updated!",
      isLoading,
      isError: Boolean(error),
      isSuccess: Boolean(data),
    });
  }, [data, error, isLoading]);

  return (
    <Box>
      <form onSubmit={handleSubmit(onSubmitNote)}>
        <Typography variant="body1" gutterBottom>
          Update note
        </Typography>
        <Grid2
          container
          justifyContent="space-around"
          spacing={5}
          rowSpacing={0}
          sx={{
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          <Grid2 xs>
            <FormGroup sx={{ mb: 2 }}>
              <TextField
                {...register("title", {
                  required: "Title is required",
                })}
                size="small"
                color="secondary"
                label="Title"
                margin="dense"
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <Typography color="error.main" variant="caption">
                {errors.title?.message}
              </Typography>
            </FormGroup>
          </Grid2>
          <Grid2 xs>
            <FormGroup sx={{ mb: 2 }}>
              <DatePicker
                size="small"
                color="secondary"
                label="Deadline"
                margin="dense"
                fullWidth
                showTimeSelect={true}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
              <Typography color="error.main" variant="caption">
                {!selectedDate && "Deadline is required"}
              </Typography>
            </FormGroup>
          </Grid2>
        </Grid2>

        <FormGroup sx={{ mb: 2 }}>
          <TextField
            {...register("content", {
              required: "Note content is required",
            })}
            size="small"
            color="secondary"
            label="Note content"
            margin="dense"
            multiline
            minRows={4}
            maxRows={7}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
          <Typography color="error.main" variant="caption">
            {errors.content?.message}
          </Typography>
        </FormGroup>
        <Grid2
          container
          justifyContent="space-between"
          spacing={5}
          rowSpacing={0}
          sx={{
            flexDirection: { xs: "column", lg: "row" },
          }}
        >
          <Grid2 xs>
            <FormGroup sx={{ mb: 4 }}>
              <FormLabel>Add files</FormLabel>
              <Dropzone
                selectedFiles={selectedFiles}
                setSelectedFiles={setSelectedFiles}
              />
            </FormGroup>
          </Grid2>
          <Grid2 xs>
            <Typography>Current files</Typography>
            {currentFiles?.map((file, i) => (
              <Box
                className="dropzone-file-preview"
                key={i}
                sx={{ flexDirection: { xs: "column", md: "row" } }}
              >
                <Typography component="span">
                  {`${file?.filename?.slice(0, 28)}...${file?.filename
                    ?.split(".")
                    .pop()}`}
                </Typography>
                <Typography component="span">
                  {convertBytesToKB(file.size)} kb
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() =>
                    window.confirm("Are you sure? File will be deleted") &&
                    handleRemove(file.path)
                  }
                  sx={{ p: 0, minWidth: 25 }}
                >
                  X
                </Button>
              </Box>
            ))}
          </Grid2>
        </Grid2>

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            // disabled={isSubmitting}
          >
            Update note
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default EditNoteForm;
