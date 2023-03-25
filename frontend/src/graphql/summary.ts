import { Egg } from "@mui/icons-material";

//config
const client = new ApolloClient({
  uri: "https://flyby-router-demo.herokuapp.com/",
  cache: new InMemoryCache(),
});

//running queries directly without hooks//not as powerful//can be used for pre-rendering
client
  .query({
    query: gql`
      query GetLocations {
        locations {
          id
          name
          description
          photo
        }
      }
    `,
  })
  .then((result) => console.log(result));

  //Eg pre-rendering://when you now move to the component, the useQuery will already have data from cache
//    onMouseOver={() =>
//               client.query({
//                 query: GET_DOG,
//                 variables: { breed: data.breed }
//               })
//             }

//HOOKS
const {
  loading, //loading state for fetching & refetching if notifyOnNetworkStatusChange: true
  error,
  data,
  refetch, //refresh query results in response to a particular user action//calling onClick= {()=> refetch()}//uses useQuery variables //or refetch({ breed: 'new_dog_breed' })}//overrides useQuery vars
  networkStatus, //if (networkStatus === NetworkStatus.refetch) return 'Refetching!';//when notifyOnNetworkStatusChange: true,//not needed as loading is updated as well
fetchMore,//A function that helps you fetch the next set of results for a paginated list field. 
client,//instance of apollo client
} = useQuery(GET_DOG_PHOTO, {
  variables: { breed },//variables for the query
  pollInterval: 500, //enable polling/execute query at an interval// in ms//0 = no polling//
  notifyOnNetworkStatusChange: true, //needed when using refetch() to call useQuery with new variables//controls refetching state by updating loading status//he in-progress query's associated component re-renders whenever the network status changes or a network error occurs.
  fetchPolicy: "network-only", // Doesn't check cache before making a network request//default is to not fetch if cache data exist i.e  "cache-first"
  nextFetchPolicy: "cache-first", // Used for subsequent executions//get data from cache if exists
  onCompleted: (data: TData | {}) => void,//callback function that's called when your query successfully completes with zero errors//get query's result data
 onError:(error: ApolloError) => void,//A callback function that's called when the query encounters one or more errors (unless errorPolicy is ignore).
updateQuery:(mapFn: (previousResult: TData, options: { variables: TVariables }) => TData) => void,///A function that enables you to update the query's cached result without executing a followup GraphQL operation. 
 errorPolicy: "all" //default is 'none'//if any error(graphql or network error), data field is null, and error: [..errors]//all would allow you to use partial data//not good

});
//usage of notifyOnNetw.. //if (networkStatus === NetworkStatus.refetch) return 'Refetching!';//when you call refetch()

//pagination//fetchMore fn
//1.offset based--> offset argument that indicates where in the list the server should start when returning items for a particular query.
//it doesn't identify the id of each object inside the array
 const { loading, data, fetchMore } = useQuery(FEED_QUERY, {
    variables: {
      offset: 0,
      limit: 10
    },
  });

  //calling fetchMore//the fn can take diff variables or if no variables, will be called by defaults in useQuery
  //doesn't automatically merge its result with the original query's cached result. 
  onClick={() => fetchMore({
        variables: {
          offset: data.feed.length
        },})}



 //2. cursor-based pagination-->offset based i simple but in other cases, you should avoid it in favor of cursor-based pagination, because moving or removing items can shift offsets. This causes items to be skipped or duplicated if changes occur between paginated queries.       
//uses list element IDs as cursors to identify each object inside the array
// /Since numeric offsets within paginated lists can be unreliable, a common improvement is to identify the beginning of a page using some unique identifier that belongs to each element of the list.




const [getDog, { loading, error, data,
   called//If true, the associated lazy query has been executed.//isUninitialized//boolean
   }] = useLazyQuery(GET_DOG_PHOTO, {

fetchPolicy: "network-only", // Doesn't check cache before making a network request//default is to not fetch if cache data exist i.e  "cache-first"
variables,
onCompleted,
onError,
pollInterval,
notifyOnNetworkStatusChange: false//default
});//for executing queries in response to events instead of onMount/render//doesn't run until query/trigger fn is called
// eg onClick={() => getDog({ variables: { breed: 'bulldog' } })//variables overrides & is merged with useLazyQuery vars

//mutations
//returns a tuple//doesn't run on render
 const [
    mutateFunction, //function that you can call at any time to execute the mutation
    { data, loading, error, reset,client }//onDismiss={() => reset()}// reset the mutation's result to its initial state//eg clear error state//re-renders component
] = useMutation(INCREMENT_COUNTER, {
    //these options can also be passed to the mutate function itself//not good//pass only variables
  variables: {  },//default values//merged with variables of mutate function//will be overridden if same variable

  //refetch options//1. refetch any query affected by mutation to update cache
  refetchQueries: [
    {query: GET_POST, variables:{}}, // DocumentNode object parsed with gql
    'GetComments' // Query name
  ],

 onCompleted:(data?: TData, clientOptions?: BaseMutationOptions) => void,
onError:(error: ApolloError, clientOptions?: BaseMutationOptions) => void,
notifyOnNetworkStatusChange: false//default//If true, the in-progress mutation's associated component re-renders whenever the network status changes or a network error occurs.

});

//eg addTodo({ variables: { type: input.value } });

//example of useMutation:
 const [registerUser, { loading: load, error: err, data: da }] = useMutation(
    REGISTER_USER,
    {
      variables: { username: "alex", password: "1234", email: "12@gmail.com" },
      refetchQueries: [{query: GET_USER, variables:{id: ''}}], //re-fetches data
      //working one:
      refetchQueries: [
    {query: GET_POST}, // DocumentNode object parsed with gql
    'GetComments' // Query name
  ],
      //or update the cache
       //update cache with data of registerUser mutation
      update(cache, {data: {registerUser}}){
         //get user from cache//user from data returned by GET_USER query earlier
        const { user }: any = cache.readQuery({
          query: GET_USER
        });
        //update cache of data returned by GET_USER with the response of registerUser mutation
        cache.writeQuery({
          query: GET_USER,
          data: { user: user.push(registerUser) }, //eg also registerUser.id
        });
      },

      fetchPolicy: "network-only",//this default//always fetch when mutation is called//no need to add this
    }
  );