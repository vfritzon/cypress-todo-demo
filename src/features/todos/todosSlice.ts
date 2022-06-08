import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Todo } from "../../api/client";
import type { RootState } from "../../app/store";
import { addTodo, fetchTodos } from "./todosThunks";

interface TodosState {
  items: Array<Todo>;
  fetchStatus: "pending" | "loading" | "succeeded" | "failed";
  error?: string;
  addStatus: "pending" | "loading" | "succeeded" | "failed";
}

export const initialState: TodosState = {
  items: [],
  fetchStatus: "pending",
  addStatus: "pending",
};

export const todosSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    add(state, action: PayloadAction<Todo>) {
      state.items.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.fetchStatus = "loading";
      })
      .addCase(fetchTodos.fulfilled, (state, { payload }) => {
        state.fetchStatus = "succeeded";
        state.items = payload;
        delete state.error;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.error = action.error.message;
      })
      .addCase(addTodo.pending, (state) => {
        state.addStatus = "loading";
      })
      .addCase(addTodo.fulfilled, (state) => {
        state.addStatus = "succeeded";
        delete state.error;
      })
      .addCase(addTodo.rejected, (state, action) => {
        state.addStatus = "failed";
        state.error = action.error.message;
      });
  },
});

export const todosSelector = (state: RootState) => state.todos;
export const reducer = todosSlice.reducer;

export default todosSlice;
