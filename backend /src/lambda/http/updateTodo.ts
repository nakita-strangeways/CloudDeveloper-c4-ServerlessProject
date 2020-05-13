import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import {updateTodoItem} from '../../businessLogic/toDos'
import {getUserId} from '../utils'

const logger = createLogger('UpdateTodoFunction')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Update Todo', { event });
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  const userId = getUserId(event)

  const toDoItem = await updateTodoItem(todoId, updatedTodo, userId)

  return {
    statusCode: 200,
    body: JSON.stringify({
      item: toDoItem
    })
  }
})


handler.use(
  cors({
    credentials: true
  })
)
