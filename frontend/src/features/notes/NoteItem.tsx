import {
  Box,
  Checkbox,
  IconButton,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import React from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import showToast from "../../common/showToast";
import { useEffect } from "react";

import { Note } from "../../types/note";
import { DELETE_NOTE } from "../../graphql/mutations/noteMutations";
import { useMutation } from "@apollo/client";
import { GET_NOTES } from "../../graphql/queries/noteQueries";

type NoteItemProps = {
  note: Note;
  handleChecked: (id: string) => void;
};

const NoteItem = ({ note, handleChecked }: NoteItemProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  /* ----------------------------------------
   HANDLE DELETE NOTE
   ----------------------------------------*/

  const [deleteNote, { data, error, loading: isLoading }] = useMutation(
    DELETE_NOTE,
    {
      variables: {
        noteId: note.noteId,
      },
      refetchQueries: [
        // { query: GET_NOTES },//not working fetching but not refreshing notes// DocumentNode object parsed with gql//called with most recent variables
        "GetAllNotes", //or Query name-query you've previously executed//will be called with the most recent variables
      ],
      notifyOnNetworkStatusChange: true,
    }
  );

  // const handleDeleteNote = async (id: string) => {
  //   deleteNote({ variables: { nodeId: id } });
  // };

  //feedback
  //feedback
  useEffect(() => {
    showToast({
      message: error?.message || "Note deleted!",
      isLoading,
      isError: Boolean(error),
      isSuccess: Boolean(data),
    });
  }, [data, error, isLoading]);

  return (
    <TableRow
      key={note.noteId}
      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
    >
      <TableCell padding="checkbox" align="left">
        <Box
          sx={{ display: "flex" }}
          justifyContent="flex-start"
          alignItems="center"
        >
          <Checkbox
            checked={note.isChecked ? note.isChecked : false}
            onChange={() => handleChecked(note.noteId)}
          />
          <Typography
            component="span"
            color="secondary"
            onClick={() =>
              navigate(`/notes/view/${note.noteId}`, {
                state: { from: location },
                replace: true,
              })
            }
            sx={{ cursor: "pointer" }}
          >
            #{note.noteId}
          </Typography>
        </Box>
      </TableCell>
      <TableCell component="th" scope="row">
        {note.title}
      </TableCell>
      <TableCell>
        {new Date(note.updatedAt).toLocaleDateString("en-GB")}
      </TableCell>
      <TableCell>
        {new Date(note.deadline).toLocaleDateString("en-GB")}
      </TableCell>

      <TableCell align="center">
        <IconButton
          onClick={() =>
            navigate(`/notes/view/${note.noteId}`, {
              state: { from: location },
              replace: true,
            })
          }
        >
          <VisibilityIcon />
        </IconButton>
        <IconButton
          onClick={() =>
            navigate(`/notes/edit/${note.noteId}`, {
              state: { from: location },
              replace: true,
            })
          }
        >
          <EditIcon />
        </IconButton>
        <IconButton
          onClick={() =>
            window.confirm("Are you sure? Note will be deleted") &&
            deleteNote({ variables: { noteId: note.noteId } })
          }
        >
          <DeleteOutlineIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default NoteItem;
