import { createContext, useContext, useReducer } from "react";
import authReducer from "./Reducers";


//NOT USED//CAN'T ACCESS STATE WITHOUT USING HOOK//STATE NEEDED IN NON REACT FUNCTION ENV
//default value//initial
type InitialContextValue = Record<string, any>;

const ThemeContext = createContext<InitialContextValue>({});

interface ContextProps {
  children: JSX.Element;
}

export interface IAuthState {
  token: null | string;
}
export const Context = ({ children }: ContextProps) => {
  const initialState: IAuthState = {
    token: null,
  };

  const [state, dispatch] = useReducer(authReducer, initialState);

  return (
    <ThemeContext.Provider value={{ state, dispatch }}>
      {children}
    </ThemeContext.Provider>
  );
};
export default authReducer;

//export context selector function
export const authState = () => {
  return useContext(ThemeContext);
};
