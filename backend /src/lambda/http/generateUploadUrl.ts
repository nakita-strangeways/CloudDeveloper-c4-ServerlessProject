import 'source-map-support/register'
import * as middy from 'middy'
import { createLogger } from '../../utils/logger'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import {toDoItemExists, getUploadUrl, updateTodoAttachment} from '../../businessLogic/toDos'
import {getUserId} from '../utils'

const s3Bucket = process.env.IMAGES_S3_BUCKET
const logger = createLogger('GenerateUploadURLFunction')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Generating Upload URL', { event });
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  const validTodoId = await toDoItemExists(todoId, userId)

  if (!validTodoId) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'TODO does not exist'
      })
    }
  }

  const url = await getUploadUrl(todoId)
  const attachmentUrl = `https://${s3Bucket}.s3.amazonaws.com/${todoId}`
  await updateTodoAttachment(todoId, userId, attachmentUrl)

  return {
    statusCode: 201,
    body: JSON.stringify({
      uploadUrl: url
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)
  