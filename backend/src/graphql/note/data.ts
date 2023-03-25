import { endOfDay, startOfDay } from "date-fns";

import { RequestHandler } from "express";
import { GraphQLError } from "graphql";
import mongoose from "mongoose";
import { MyContext } from "../../types/context";
import customGraphqlError from "../../utils/customErrors";
import Note from "../auth/Note";

//filter regex
//https://attacomsian.com/blog/mongoose-like-regex
//https://stackoverflow.com/questions/43729199/how-i-can-use-like-operator-on-mongoose
//https://dev.to/itz_giddy/how-to-query-documents-in-mongodb-that-fall-within-a-specified-date-range-using-mongoose-and-node-524a
//https://stackoverflow.com/questions/11973304/mongodb-mongoose-querying-at-a-specific-date

/**----------------------------------
       GET NOTES
  ------------------------------------*/
export interface NotesQuery {
  page: number;
  size: number;
  startDate: string;
  endDate: string;
  searchTerm: string;
}

/**
 * @desc - Get all notes
 * @access - Private
 *
 */

const getAllNotes = async (args: NotesQuery, { user: userCtx }: MyContext) => {
  if (!userCtx) {
    throw customGraphqlError({ code: "UNAUTHORIZED" });
  }
  // Get all notes from MongoDB

  //const id = userCtx!._id;
  /**----------------------------------
         * PAGINATION
  ------------------------------------*/

  //query string payload
  const page = args.page || 1; //current page no. / sent as string convert to number//page not sent use 1
  const size = args.size || 15; //items per page//if not sent from FE/ use default 15
  const searchTerm = args.searchTerm || ""; //will be a case insensitive match//empty string match all
  const skip = (page - 1) * size; //eg page = 5, it has already displayed 4 * 10//so skip prev items

  //date range
  //if from fromDate:true, fetch all records not older than fromDate || no lower limit i.e not older than midnight of January 1, 1970//from midnight
  const startDate = args.startDate
    ? startOfDay(new Date(args.startDate))
    : startOfDay(new Date(0));
  // if toDate:true, fetch all records older than toDate || no upper limit i.e current date////end of day//up to midnight of that day
  const endDate = args.endDate
    ? endOfDay(new Date(args.endDate))
    : endOfDay(new Date());

  //format with date-fns or use: new Date(new Date(fromDate).setHours(0o0, 0o0, 0o0)), //start searching from the very beginning of our start date eg //=> Tue Sep 02 2014 00:00:00
  //new Date(new Date(toDate).setHours(23, 59, 59)), //up to but not beyond the last minute of our endDate /eg Tue Sep 02 2014 23:59:59.999
  //or use date-fns to add start of day & end of day

  //db.collection.find(filter/query/conditions, projection)//filter is the current term
  //can't use let query =  Note.query(). await query.count(), then await query.skip()//query already used/tracked with count()
  let filter = {
    $and: [
      // { user: id },
      { title: { $regex: `.*${searchTerm}.*`, $options: "i" } }, //like %_keyword%  & case insensitive//
      {
        updatedAt: {
          $gte: startDate, //start searching from the very beginning of our start date
          $lte: endDate, //up to but not beyond the last minute of our endDate
        },
      },
    ],
  };

  const total = await Note.find(filter).count(); //or Note.countDocument() ///total docs
  //if total = 0 //error
  if (!total) {
    throw new Error("No notes found");
  }

  const pages = Math.ceil(total / size);

  //in case invalid page is sent//out of range//not from the pages sent
  if (page > pages) {
    throw new Error("Page not found");
  }

  const result = await Note.find(filter)
    .skip(skip)
    .limit(size)
    .sort({ updatedAt: -1 }) //desc//recent first
    .lean(); //return a pure js object//not mongoose document//don't convert result to mongoose document//about 5x smaller!//faster

  return {
    pages,
    total,
    notes: result,
  };
};

/**----------------------------------
       GET NOTE
  ------------------------------------*/

/**
 * @desc - Get note
 * @access - Private
 *
 */
const getNoteById = async (noteId: number, { user: userCtx }: MyContext) => {
  if (!userCtx) {
    throw customGraphqlError({ code: "UNAUTHORIZED" });
  }
  // Get single note
  const note = await Note.findOne({ noteId }).exec();

  // If note not found
  if (!note) {
    throw new Error("Note not found");
  }

  return {
    files: note.files,
    noteId: note.noteId,
    title: note.title,
    content: note.content,
    deadline: note.deadline,
  };
};

/**----------------------------------
      CREATE NOTE
  ------------------------------------*/

export interface CreateNoteArgs {
  title?: string;
  content?: string;
  deadline?: string;
  files?: string;
}

/**
 * @desc - Create new note
 * @access - Private
 *
 */
const createNewNote = async (
  args: CreateNoteArgs,
  { user: userCtx }: MyContext
) => {
  if (!userCtx) {
    throw customGraphqlError({ code: "UNAUTHORIZED" });
  }

  const { title, content, deadline, files } = args;

  // Confirm data
  if (!title || !content || !deadline) {
    throw new Error("All fields are required");
  }

  // Create and store the new user
  const note = await Note.create({
    user: userCtx!._id,
    title,
    content,
    deadline,
    files,
  });
  // Not created
  if (!note) {
    throw new Error("Invalid note data received");
  }

  return note;
};

/**----------------------------------
       UPDATE NOTE
  ------------------------------------*/

export interface UpdateNoteArgs {
  title?: string;
  content?: string;
  deadline?: string;
  noteId: number;
  files: string;
}

/**
 * @desc - Update a note

 * @access - Private
 *
 */
const updateNote = async (
  args: UpdateNoteArgs,
  { user: userCtx }: MyContext
) => {
  if (!userCtx) {
    throw customGraphqlError({ code: "UNAUTHORIZED" });
  }
  const { title, content, deadline, noteId, files } = args;

  // Confirm data
  if (!title || !content || !deadline) {
    throw new Error("All fields are required");
  }

  // Confirm note exists to update
  //you can omit type for note//Ts will infer from type passed to model
  const note = await Note.findOne({ noteId }).exec();

  if (!note) {
    throw new Error("Note not found");
  }

  note.title = title;
  note.content = content;
  note.deadline = deadline;
  note.files = files;

  const updatedNote = await note.save();

  return {
    files: updatedNote.files,
    noteId: updatedNote.noteId,
    title: updatedNote.title,
    content: updatedNote.content,
    deadline: updatedNote.deadline,
  };
};

/**----------------------------------
       DEL NOTE
  ------------------------------------*/

/**
 * @desc - Delete a note

 * @access - Private
 *
 */
const deleteNote = async (noteId: number, { user: userCtx }: MyContext) => {
  if (!userCtx) {
    throw customGraphqlError({ code: "UNAUTHORIZED" });
  }
  // Confirm note exists to delete
  const note = await Note.findOne({ noteId }).exec();

  if (!note) {
    throw new Error("Note not found");
  }

  await note.deleteOne();

  return note;
};

export { getAllNotes, getNoteById, createNewNote, updateNote, deleteNote };
