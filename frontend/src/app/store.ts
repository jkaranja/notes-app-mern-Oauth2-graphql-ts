import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
  },

  //disable redux devTool
  devTools: process.env.NODE_ENV !== "production",
});

//for typing redux toolkit hooks: useDispatch/useSelector
// Infer the `RootState` and `AppDispatch` types from the store itself
//Inferring these types from the store itself means that they correctly update as you add more state slices or modify middleware settings.

export type RootState = ReturnType<typeof store.getState>; //type for state in useSelector
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState} + thunk middleware types//for useDispatch hook
export type AppDispatch = typeof store.dispatch;

export default store;
