import { gql } from "@apollo/client";

export const CREATE_NOTE = gql`
  mutation CreateNewNote(
    $title: String!
    $content: String!
    $deadline: String!
    $files: String!
  ) {
    createNewNote(
      title: $title
      content: $content
      deadline: $deadline
      files: $files
    ) {
      noteId
      title
      content
      deadline
    }
  }
`;

export const UPDATE_NOTE = gql`
  mutation UpdateNote(
    $noteId: Int!
    $title: String!
    $content: String!
    $deadline: String!
    $files: String
  ) {
    updateNote(
      noteId: $noteId
      title: $title
      content: $content
      deadline: $deadline
      files: $files
    ) {
      noteId
      title
      content
      deadline
    }
  }
`;

export const DELETE_NOTE = gql`
  mutation DeleteNote($noteId: Int!) {
    deleteNote(noteId: $noteId) {
      noteId
      title
      content
      deadline
    }
  }
`;
