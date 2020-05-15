import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import {getUserId} from '../utils'
import {deleteToDo} from '../../businessLogic/toDos'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
  
const logger = createLogger('DeleteTodoFunction')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Deleteing Todo', { event });
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  const deletedItem = await deleteToDo( todoId, userId )
  
  return {
    statusCode: 201,
    body: JSON.stringify({
      deletedItem
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)
  