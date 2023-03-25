export const typeDefs = `#graphql
    type Note { 
      noteId: Int!
      title: String!
      content: String!
      deadline: String!
  }

  type NoteResults{
  pages: Int
  total: Int
  notes: [Note!]
  
  }
  

  type Message {
    message: String!
  }

  #Queries

  type Query {
   notes(page: Int, size: Int, endDate: String, startDate: String, searchTerm:String): NoteResults
   note(noteId: Int!): Note 
  }

  #Mutations
  type Mutation {   
     createNewNote(title: String!, content: String!, deadline: String!, files: String): Note
     updateNote(noteId: Int!, title: String!, content: String!, deadline: String!, files: String): Note 
     deleteNote(noteId: Int!): Note
  }
`;
