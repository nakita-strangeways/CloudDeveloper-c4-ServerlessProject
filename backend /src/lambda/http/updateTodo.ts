import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

const docClient = new AWS.DynamoDB.DocumentClient()
const toDoTable = process.env.TODO_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  const updatedItem = {
    id: todoId,
    ...updatedTodo
  }
  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  await docClient.put({
    TableName: toDoTable,
    Item: updatedItem
  }).promise()

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      updatedItem
    })
  }
}
