import React, { createContext, useReducer, useContext } from "react";

const initialState = {
    userID: null, // Kullanıcı ID'si için yeni state
    queuedPlayers: [],
    inGamePlayers: [],
    gameSummary: null,
    isPlaying: false,
    inGame: false,
  };
  
  const reducer = (state, action) => {
    switch (action.type) {
      case "SET_USER_ID":
        return { ...state, userID: action.payload }; // userID'yi güncelle
      case "SET_QUEUED_PLAYERS":
        return { ...state, queuedPlayers: action.payload };
      case "SET_IN_GAME_PLAYERS":
        return { ...state, inGamePlayers: action.payload };
      case "SET_GAME_SUMMARY":
        return { ...state, gameSummary: action.payload };
      case "SET_IS_PLAYING":
        return { ...state, isPlaying: action.payload };
      case "SET_IN_GAME":
        return { ...state, inGame: action.payload };
      default:
        return state;
    }
  };

const GlobalStateContext = createContext();
const GlobalDispatchContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <GlobalStateContext.Provider value={state}>
      <GlobalDispatchContext.Provider value={dispatch}>
        {children}
      </GlobalDispatchContext.Provider>
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => useContext(GlobalStateContext);
export const useGlobalDispatch = () => useContext(GlobalDispatchContext);