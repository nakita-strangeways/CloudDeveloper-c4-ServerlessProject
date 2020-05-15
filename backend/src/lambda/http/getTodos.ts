import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import {getAllTodoItems} from '../../businessLogic/toDos'
import {getUserId} from '../utils'

const logger = createLogger('GetAllTodosFunction')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Getting Todos', { event });
  const userId = getUserId(event)
  const items = await getAllTodoItems(userId)

  return {
    statusCode: 200,
    body: JSON.stringify({
      items
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)
