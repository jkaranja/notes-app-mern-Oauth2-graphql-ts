import { gql } from "@apollo/client";
export const GET_NOTES = gql`
  query GetAllNotes(
    $page: Int
    $size: Int
    $endDate: String
    $startDate: String
    $searchTerm: String
  ) {
    notes(
      page: $page
      size: $size
      endDate: $endDate
      startDate: $startDate
      searchTerm: $searchTerm
    ) {
      notes {        
        noteId
        title
        content
        deadline
      }
      total
      pages
    }
  }
`;

export const GET_NOTE = gql`
  query GetNoteById($noteId: Int!) {
    note(noteId: $noteId) {     
      noteId
      title
      content
      deadline
    }
  }
`;
