import { z } from "zod";

export async function fetchTodos(): Promise<Array<Todo>> {
  const response = await fetch("/api/todos");
  const data = await response.json();

  return todoSchema.array().parseAsync(data);
}

const todoSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(["todo", "doing", "done"]),
});

export type Todo = z.infer<typeof todoSchema>;

export async function addTodo(todo: Omit<Todo, "id">): Promise<Todo> {
  const response = await fetch("/api/todos", {
    method: "POST",
    body: JSON.stringify(todo),
  });

  if (response.status === 500) {
    throw new Error(response.status.toString());
  }

  const data = await response.json();

  return todoSchema.parseAsync(data);
}
