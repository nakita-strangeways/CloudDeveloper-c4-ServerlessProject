import * as uuid from 'uuid'
import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const toDoAccess = new TodoAccess()

export async function getAllTodoItems(userId: string): Promise<TodoItem[]> {
  if (!userId) {
    return []
  }
  return toDoAccess.getAllTodoItems(userId)
}

export async function createTodoItem(
  toDoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  const itemId = uuid.v4()  
  return await toDoAccess.createTodoItem({
    todoId: itemId,
    userId: userId,
    name: toDoRequest.name,
    createdAt: new Date().toISOString(),
    dueDate:toDoRequest.dueDate,
    done: false,
  })
}

export async function toDoItemExists(todoId: string, userId: string) {
  const item = await toDoAccess.getTodoItem(todoId, userId)
  return !!item
}

export function getUploadUrl(todoId: string): Promise<string> {
  return toDoAccess.generateUploadUrl(todoId)
}

export async function updateTodoAttachment(  
  todoId: string,
  userId: string,
  attachmentUrl?: string
): Promise <void> {
  await toDoAccess.updateTodoAttachment(userId,todoId, attachmentUrl)
}

export async function updateTodoItem(todoId: string, updatedTodo: UpdateTodoRequest, userId: string, ): Promise<void> {
  return await toDoAccess.updateTodoItem(updatedTodo, userId, todoId)
}

export function deleteToDo(todoId: string, userId: string): Promise<string> {
  return toDoAccess.deleteToDo(todoId, userId)
}
