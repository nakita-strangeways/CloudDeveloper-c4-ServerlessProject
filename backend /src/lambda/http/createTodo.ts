import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { parseUserId } from '../../auth/utils'

const docClient = new AWS.DynamoDB.DocumentClient()
const toDoTable = process.env.TODO_TABLE

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  const itemId = uuid.v4()
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  const newItem = {
    id: itemId,
    userId: parseUserId(jwtToken),
    ...newTodo
  }

  await docClient.put({
    TableName: toDoTable,
    Item: newItem
  }).promise()

  return {
    statusCode: 201,
    body: JSON.stringify({
      newItem
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)
