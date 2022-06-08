import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { todosSelector } from "../../features/todos/todosSlice";
import { addTodo, fetchTodos } from "../../features/todos/todosThunks";

import { TodosList } from "../TodosList";

export function App() {
  const {
    items: todos,
    fetchStatus,
    addStatus,
    error: error,
  } = useAppSelector(todosSelector);

  const dispatch = useAppDispatch();
  useEffect(() => {
    if (fetchStatus === "pending") {
      dispatch(fetchTodos());
    }
  }, [fetchStatus, dispatch]);

  const newTodoInput = useRef<HTMLInputElement>(null);
  const [newTodoName, setNewTodoName] = useState("");
  async function onAddTodo() {
    const result = await dispatch(addTodo(newTodoName));
    if (result.meta.requestStatus === "fulfilled") {
      setNewTodoName("");
      newTodoInput.current?.focus();
    }
  }

  return (
    <>
      <h1>Todo Board</h1>
      {fetchStatus === "loading" ? (
        <p>Loading todos...</p>
      ) : (
        <>
          {fetchStatus === "failed" || addStatus === "failed" ? (
            <>
              <p>Oops, something went wrong</p>
              <pre>{error ?? ""}</pre>
            </>
          ) : (
            <TodosList todos={todos} />
          )}
        </>
      )}
      <label htmlFor="new-todo">New todo: </label>
      <input
        ref={newTodoInput}
        type="text"
        id="new-todo"
        value={newTodoName}
        disabled={addStatus === "loading"}
        onChange={(e) => setNewTodoName(e.target.value)}
        onKeyUp={(e) => e.key === "Enter" && onAddTodo()}
      ></input>
      <button
        disabled={addStatus === "loading"}
        onClick={() => {
          onAddTodo();
        }}
      >
        Add
      </button>
    </>
  );
}
