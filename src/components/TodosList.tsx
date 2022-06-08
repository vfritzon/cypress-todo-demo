import { Todo } from "../api/client";

export function TodosList({ todos }: { todos: Array<Todo> }) {
  if (todos.length === 0) return <p>Nothing to do yet</p>;
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.name}</li>
      ))}
    </ul>
  );
}
