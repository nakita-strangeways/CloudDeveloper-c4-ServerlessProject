import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import {deleteToDo} from '../../businessLogic/toDos'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
  
  export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Remove a TODO item by id
    console.log('Processing event: ', event)
    const todoId = event.pathParameters.todoId
    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]

    const deletedItem = await deleteToDo( todoId, jwtToken )
    
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
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
  