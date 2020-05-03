import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
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

