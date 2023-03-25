import * as React from "react";
import Button from "@mui/material/Button";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";

import DialogTitle from "@mui/material/DialogTitle";
import { Grid, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DatePicker from "../../components/DatePicker";
import { useEffect } from "react";
import { useState } from "react";

type NoteFilterProps = {
  open: boolean;
  handleClose: () => void;
  endDate: string | Date;
  startDate: string | Date;
  setEndDate: React.Dispatch<React.SetStateAction<string | Date>>;
  setStartDate: React.Dispatch<React.SetStateAction<string | Date>>;
  handleDateFilter: () => void;
  filterError: boolean;
  setFilterError: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function NoteFilter({
  open,
  handleClose,
  endDate,
  startDate,
  setEndDate,
  setStartDate,
  handleDateFilter,
  filterError,
  setFilterError,
}: NoteFilterProps) {
  const [dateExpanded, setDateExpanded] = useState(false);

  //after date is set/collapse dialog content
  useEffect(() => {
    setDateExpanded(false);
    setFilterError(false);
    //override date picker null with '', null is displayed & also sent as 'null' in query string to backend=true
    if (endDate === null || startDate === null) {
      setEndDate("");
      setStartDate("");
    }
  }, [endDate, startDate]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth //works together with max width
      maxWidth="sm" //default is small
    >
      <DialogTitle>
        <Grid container justifyContent="space-between">
          <Grid>Filter by date</Grid>
          <Grid>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Grid>
        </Grid>
      </DialogTitle>

      <DialogContent sx={{ height: dateExpanded ? "30vh" : "auto" }}>
        <Grid container justifyContent="space-between">
          <Grid textAlign="center">
            <DatePicker
              onFocus={() => setDateExpanded(true)}
              onBlur={() => setDateExpanded(false)}
              size="small"
              color="secondary"
              label="From"
              margin="dense"
              required
              fullWidth
              showTimeSelect={false}
              dateFormat="dd/MM/yyyy"
              selectedDate={startDate}
              setSelectedDate={setStartDate}
              filterDate={() => true}
            />
          </Grid>
          <Grid>
            <DatePicker
              onFocus={() => setDateExpanded(true)}
              onBlur={() => setDateExpanded(false)}
              size="small"
              color="secondary"
              label="To"
              margin="dense"
              required
              fullWidth
              showTimeSelect={false}
              dateFormat="dd/MM/yyyy"
              selectedDate={endDate}
              setSelectedDate={setEndDate}
              filterDate={() => true}
            />
          </Grid>
        </Grid>
        <Typography color="error.main" variant="caption">
          {filterError && "Fill at least one field"}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleDateFilter}
        >
          Filter
        </Button>
      </DialogActions>
    </Dialog>
  );
}
