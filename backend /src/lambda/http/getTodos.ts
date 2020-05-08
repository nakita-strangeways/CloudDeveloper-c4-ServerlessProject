import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
// import * as AWS  from 'aws-sdk'
import {getAllTodoItems} from '../../businessLogic/toDos'

// const docClient = new AWS.DynamoDB.DocumentClient()
// const toDoTable = process.env.TODO_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  console.log('Processing event: ', event)

  // const result = await docClient.scan({
  //   TableName: toDoTable
  // }).promise()

  // const items = result.Items

  const items = await getAllTodoItems()

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items
    })
  }
}

