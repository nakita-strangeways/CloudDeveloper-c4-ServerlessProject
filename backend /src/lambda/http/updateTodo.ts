// import 'source-map-support/register'
// import * as AWS  from 'aws-sdk'
// import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
// import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
// import * as middy from 'middy'
// import { cors } from 'middy/middlewares'
// // import { parseUserId } from '../../auth/utils'

// const docClient = new AWS.DynamoDB.DocumentClient()
// const toDoTable = process.env.TODO_TABLE

// export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
//   // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
//   const todoId = event.pathParameters.todoId
//   const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
//   const authorization = event.headers.Authorization
//   const split = authorization.split(' ')
//   const jwtToken = split[1]
//   // const userId = parseUserId(jwtToken)

//   const updatedItem = {
//     id: todoId,
//     ...updatedTodo,
//     jwtToken
//   }
//   const toDoItem = await updatedTodo(updatedItem)

//   return {
//     statusCode: 200,
//     body: JSON.stringify({
//       item: toDoItem
//     })
//   }
// })


// handler.use(
//   cors({
//     credentials: true
//   })
// )
