import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { parseUserId } from '../auth/utils'

const toDoAccess = new TodoAccess()

export async function getAllTodoItems(): Promise<TodoItem[]> {
  return toDoAccess.getAllTodoItems()
}

export async function createTodoItem(
  toDoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {

  const itemId = uuid.v4()  
  const userId = parseUserId(jwtToken)

  return await toDoAccess.createTodoItem({
    todoId: itemId,
    userId: userId,
    name: toDoRequest.name,
    createdAt: new Date().toISOString(),
    dueDate:toDoRequest.dueDate,
    done: false,
  })
}

export async function toDoItemExists(todoId: string, jwtToken: string) {
  const userId = parseUserId(jwtToken)
  const item = await toDoAccess.getTodoItem(todoId, userId)
  return !!item
}

export function getUploadUrl(todoId: string): Promise<string> {
  return toDoAccess.generateUploadUrl(todoId)
}

export async function updateTodoAttachment(  
  todoId: string,
  jwtToken: string,
  attachmentUrl?: string
): Promise <void> {
  const userId = parseUserId(jwtToken)
  await toDoAccess.updateTodoAttachment(userId,todoId, attachmentUrl)
}

export async function updateTodoItem(todoId: string, updatedTodo: UpdateTodoRequest, jwtToken: string, ): Promise<void> {
  const userId = parseUserId(jwtToken)
  return await toDoAccess.updateTodoItem(updatedTodo, userId, todoId)
}

export function deleteToDo(todoId: string, jwtToken: string): Promise<string> {
  const userId = parseUserId(jwtToken)
  return toDoAccess.deleteToDo(todoId, userId)
}
