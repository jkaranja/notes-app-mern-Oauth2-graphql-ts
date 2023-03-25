import { Types } from "mongoose";

export interface INoteFile {
  path: string;
  filename: string;
  mimetype: string;
  size: number;
  destination?: string;
}

//document interface//extending doc adds active record methods for modifying the document
export interface INote extends Document {
  user: Types.ObjectId;
  title: string;
  content: string | undefined;
  deadline: string;
  // files: INoteFile[];
  files: string,
  noteId: number;
}
