//filter regex
//https://attacomsian.com/blog/mongoose-like-regex
//https://stackoverflow.com/questions/43729199/how-i-can-use-like-operator-on-mongoose
//https://dev.to/itz_giddy/how-to-query-documents-in-mongodb-that-fall-within-a-specified-date-range-using-mongoose-and-node-524a
//https://stackoverflow.com/questions/11973304/mongodb-mongoose-querying-at-a-specific-date



//apollo no longer support  Mongoose multipart uploads

//https://www.apollographql.com/blog/backend/file-uploads/file-upload-best-practices/

//file upload
//graphql only works with JSON Object( strings) for req, res

//approach 1: convert and send file as blob/base64 text/string// it will be sent as part of the json object//not good//increases file size//can';t be streamed
//-will occupy the whole size of the file in memory/ram on server since it can't be streamed
// approach 2: create a custom REST  api route//not good//will need to manage rest and graphql//auth is also an issue

//approach 3: make graphql accept multipart req using graphql-upload(formally, graphql-apollo-server) $ graphql-apollo-client in frontend
//Unfortunately, there's no standard to handle Multipart Requests with GraphQL. This means, your solution will not be easily portable across different languages or implementations and your client implementation depends on the exact implementation of the server.
///Without Multipart, any GraphQL client can talk to any GraphQL server. All parties agree that the protocol is GraphQL, so all these implementations are compatible. If you're using a non-standard way of doing GraphQL over Multipart HTTP Requests, you're losing this flexibility.
//with the cons above, we still use this approach but add the custom logic needed on GraphQL Server & client
//we will use approach 3 since sending files as multipart is the only good sol for sending files

//https://wundergraph.com/blog/graphql_file_uploads_evaluating_the_5_most_common_approaches
// https://medium.com/@raywang999/graphql-file-upload-mern-stack-tutorial-2ea1bcd5041
// https://www.youtube.com/watch?v=BcZ_ItGplfE&t=350s
