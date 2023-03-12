import Note, { INote, INoteFile } from "../models/noteModel";
import User from "../models/userModel";
import deleteFiles from "../utils/deleteFiles";
import { endOfDay, startOfDay } from "date-fns";
import cleanFiles from "../utils/cleanFiles";
import { RequestHandler } from "express";
import mongoose from "mongoose";


//filter regex
//https://attacomsian.com/blog/mongoose-like-regex
//https://stackoverflow.com/questions/43729199/how-i-can-use-like-operator-on-mongoose
//https://dev.to/itz_giddy/how-to-query-documents-in-mongodb-that-fall-within-a-specified-date-range-using-mongoose-and-node-524a
//https://stackoverflow.com/questions/11973304/mongodb-mongoose-querying-at-a-specific-date

interface SearchQuery {
  page: string;
  size: string;
  toDate: string;
  fromDate: string;
  search: string;
}

/**
 * @desc - Get all notes
 * @route - GET api/notes
 * @access - Private
 *
 */

const getAllNotes: RequestHandler<
  unknown,
  unknown,
  unknown,
  SearchQuery
> = async (req, res) => {
  // Get all notes from MongoDB

  interface User {
    _id: mongoose.Types.ObjectId;
  }

  const { _id: id } = req.user as User;
  /**----------------------------------
         * PAGINATION
  ------------------------------------*/

  //query string payload
  const page = parseInt(req.query.page) || 1; //current page no. / sent as string convert to number//page not sent use 1
  const size = parseInt(req.query.size) || 15; //items per page//if not sent from FE/ use default 15
  const { fromDate, toDate } = req.query;
  const searchTerm = req.query.search;
  const skip = (page - 1) * size; //eg page = 5, it has already displayed 4 * 10//so skip prev items

  //date range
  //if from fromDate:true, fetch all records not older than fromDate || no lower limit i.e not older than midnight of January 1, 1970
  const startDate = fromDate
    ? startOfDay(new Date(fromDate))
    : new Date(Date.now());
  // if toDate:true, fetch all records older than toDate || no upper limit i.e current date
  const endDate = toDate
    ? endOfDay(new Date(toDate))
    : new Date();
  //format with date-fns or use: new Date(new Date(fromDate).setHours(0o0, 0o0, 0o0)), //start searching from the very beginning of our start date eg //=> Tue Sep 02 2014 00:00:00
  //new Date(new Date(toDate).setHours(23, 59, 59)), //up to but not beyond the last minute of our endDate /eg Tue Sep 02 2014 23:59:59.999
  //or use date-fns to add start of day & end of day

  let query = Note.find({
    $and: [
      { user: id },
      { title: { $regex: `.*${searchTerm}.*`, $options: "i" } }, //like %_keyword%  & case insensitive//
      {
        updatedAt: {
          $gte: startDate, //start searching from the very beginning of our start date
          $lte: endDate, //up to but not beyond the last minute of our endDate
        },
      },
    ],
  });

  const total = await query.count(); //Task.countDocument() ///total docs
  //if total = 0 //error
  if (!total) {
    return res.status(400).json({ message: "No notes found" });
  }

  const pages = Math.ceil(total / size);

  //in case invalid page is sent//out of range//not from the pages sent
  if (page > pages) {
    return res.status(400).json({ message: "Page not found" });
  }

  const result = await query
    .skip(skip)
    .limit(size)
    .sort({ updatedAt: -1 }) //desc//recent first
    .lean();

  res.status(200).json({
    pages,
    notes: result,
  });
};

/**
 * @desc - Get note
 * @route - GET api/notes/:id
 * @access - Private
 *
 */
const getNoteById: RequestHandler = async (req, res) => {
  // Get single note
  const { noteId } = req.params;

  const note = await Note.findOne({ noteId }).exec();

  // If note not found
  if (!note) {
    return res.status(400).json({ message: "Note not found" });
  }

  res.json({
    files: note.files,
    noteId: note.noteId,
    title: note.title,
    content: note.content,
    deadline: note.deadline,
  });
};

interface CreateNoteBody {
  title?: string;
  content?: string;
  deadline?: Date;
}

/**
 * @desc - Create new note
 * @route - POST api/notes
 * @access - Private
 *
 */

const createNewNote: RequestHandler<
  unknown,
  unknown,
  CreateNoteBody,
  unknown
> = async (req, res) => {
  const { title, content, deadline } = req.body;

  const { files, user } = req;

  //clean files
  const fileArr = cleanFiles(files as INoteFile[]);

  // Confirm data
  if (!title || !content || !deadline) {
    deleteFiles(fileArr); //clear failed req
    return res.status(400).json({ message: "All fields are required" });
  }

  // Create and store the new user
  const note = await Note.create({
    user: user!._id,
    title,
    content,
    deadline,
    files: fileArr,
  });

  if (!note) {
    deleteFiles(fileArr); //clear failed req
    return res.status(400).json({ message: "Invalid note data received" });
  }

  // Created
  return res.status(201).json({ message: "New note created" }); //201 is default
};

interface UpdateNoteParams {
  noteId: string;
}

interface UpdateNoteBody {
  title?: string;
  content?: string;
  deadline?: Date;
}

/**
 * @desc - Update a note
 * @route - PATCH /notes/:id
 * @access - Private
 *
 */
const updateNote: RequestHandler<
  UpdateNoteParams,
  unknown,
  UpdateNoteBody,
  unknown
> = async (req, res) => {
  const { noteId } = req.params;
  const { title, content, deadline } = req.body;

  const { user, files } = req;

  //console.log(req.body.removedFiles[0])

  //clean files
  const fileArr = cleanFiles(files as INoteFile[]);

  // if (!id.match(/^[0-9a-fA-F]{24}$/)) {
  //   deleteFiles(fileArr); //clear failed req
  //   return res.status(400).json({ message: "Note not found" });
  // }
  //or use
  //  if (!mongoose.isValidObjectId(noteId)) {
  //    return res.status(400).json({ message: "Note not found" });
  //  }

  // Confirm data
  if (!title || !content || !deadline) {
    deleteFiles(fileArr); //clear failed req
    return res.status(400).json({ message: "All fields are required" });
  }

  // Confirm note exists to update
  //you can omit type for note//Ts will infer from type passed to model
  const note: INote | null = await Note.findOne({ noteId }).exec();

  if (!note) {
    deleteFiles(fileArr); //clear failed req
    return res.status(400).json({ message: "Note not found" });
  }
  //del prev files//if new files exist
  if (fileArr?.length) {
    deleteFiles(note.files);
  }

  note.title = title;
  note.content = content;
  note.deadline = deadline;
  fileArr?.length && (note.files = fileArr);

  const updatedNote = await note.save();

  res.json({
    files: updatedNote.files,
    noteId: updatedNote.noteId,
    title: updatedNote.title,
    content: updatedNote.content,
    deadline: updatedNote.deadline,
  });
};

/**
 * @desc - Delete a note
 * @route - DELETE /notes/:id
 * @access - Private
 *
 */
const deleteNote: RequestHandler = async (req, res) => {
  const { noteId } = req.params;

  // Confirm note exists to delete
  const note = await Note.findOne({ noteId }).exec();

  if (!note) {
    return res.status(400).json({ message: "Note not found" });
  }

  deleteFiles(note.files); //del files for note

  const result = await note.deleteOne();

  res.json({ message: `Note deleted` });
};

export { getAllNotes, getNoteById, createNewNote, updateNote, deleteNote };
