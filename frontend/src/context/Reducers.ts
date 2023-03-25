import { IAuthState } from "./Context";




interface IActionType {
  type: string;
  payload: any
}



const authReducer = (state: IAuthState, action: IActionType) => {
  switch (action.type) {
    case "LOGIN":
      //client.resetStore()
      return { token: action.payload };

    case "LOGOUT":
      //client.clearStore();
      return { token: null };

    default:
      return state;
  }
};

export default authReducer;
