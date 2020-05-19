import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import {createTodoItem} from '../../businessLogic/toDos'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import {getUserId} from '../utils'

const logger = createLogger('CreateTodoFunction')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Create Todo', { event });
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const userId = getUserId(event)
  const newItem = await createTodoItem(newTodo, userId )

  return {
    statusCode: 201,
    body: JSON.stringify({
      item: newItem
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)
