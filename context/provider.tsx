import React, { useReducer, createContext, ReactNode } from 'react'
import { reducer } from './reducer'
import { AppState, AppAction, ContextValue } from '../src/types'

const initialState: AppState = {
  userData: { displayName: null },
  isLoggedIn: false,
  userDrafts: null,
}

const Context = createContext<ContextValue>({} as ContextValue)

interface ContextProviderProps {
  children: ReactNode
}

const ContextProvider = ({ children }: ContextProviderProps) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const value: ContextValue = { state, dispatch }

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export { Context, ContextProvider }
