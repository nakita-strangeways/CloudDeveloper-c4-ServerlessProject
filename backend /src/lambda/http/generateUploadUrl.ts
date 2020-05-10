import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import {toDoItemExists, getUploadUrl, updateTodoAttachment} from '../../businessLogic/toDos'

const s3Bucket = process.env.IMAGES_S3_BUCKET

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  const todoId = event.pathParameters.todoId
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const validTodoId = await toDoItemExists(todoId, jwtToken)

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
  await updateTodoAttachment(todoId, jwtToken, attachmentUrl)

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
  