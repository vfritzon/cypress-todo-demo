import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  reducer as todosReducer,
  initialState as todosInitialState,
} from "../features/todos/todosSlice";

export const rootReducer = combineReducers({ todos: todosReducer });
export const initialState: RootState = { todos: todosInitialState };

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: initialState,
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
