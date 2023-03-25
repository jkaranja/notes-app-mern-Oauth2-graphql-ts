import { MyContext } from "../../types/context";
import * as noteApi from "./data";

export const resolvers = {
  Query: {
    //parent, args, contextValue
    notes: async (
      _: unknown,
      args: noteApi.NotesQuery,
      contextValue: MyContext
    ) => {
      return await noteApi.getAllNotes(args, contextValue);
    },
    note: async (
      _: unknown,
      args: { noteId: number },
      contextValue: MyContext
    ) => {
      return await noteApi.getNoteById(args.noteId, contextValue);
    },
  },

  Mutation: {
    createNewNote: async (
      _: unknown,
      args: noteApi.CreateNoteArgs,
      contextValue: MyContext
    ) => {
      return await noteApi.createNewNote(args, contextValue);
    },

    updateNote: async (
      _: unknown,
      args: noteApi.UpdateNoteArgs,
      contextValue: MyContext
    ) => {
      return await noteApi.updateNote(args, contextValue);
    },

    deleteNote: async (
      _: unknown,
      args: { noteId: number },
      contextValue: MyContext
    ) => {
      return await noteApi.deleteNote(args.noteId, contextValue);
    },
  },
};
