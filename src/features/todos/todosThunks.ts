import { createAsyncThunk } from "@reduxjs/toolkit";
import * as client from "../../api/client";
import todosSlice from "./todosSlice";

export const fetchTodos = createAsyncThunk(
  "todos/fetchTodos",
  client.fetchTodos
);

export const addTodo = createAsyncThunk(
  "todos/addTodo",
  async (name: string, { dispatch }) => {
    const addedTodo = await client.addTodo({ name, status: "todo" });
    dispatch(todosSlice.actions.add(addedTodo));
  }
);
