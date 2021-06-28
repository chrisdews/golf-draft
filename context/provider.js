import { useReducer, createContext } from "react";
import { reducer } from "./reducer";

// initial state
const initialState = {
  userData: {
      displayName: null
  },
};

const Context = createContext({});

const ContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export { Context, ContextProvider };
