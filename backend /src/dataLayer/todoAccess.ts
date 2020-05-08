import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todoTable = process.env.TODO_TABLE) {
  }

  async getAllTodoItems(): Promise<TodoItem[]> {
    console.log('Getting all todo items')

    const result = await this.docClient.scan({
      TableName: this.todoTable
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodoItem(toDoItem: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todoTable,
      Item: toDoItem
    }).promise()

    return toDoItem
  }

  async deleteToDo(itemId:string, userId:string): Promise<string> {
    console.log("userId", userId)
    const params = {
      TableName: this.todoTable,
      Key: {
        userId: userId,
        todoId: itemId
      }
    }

    const result = await this.docClient.delete(
      params
    ).promise()
    console.log(result)
    return '' as string
  }
}


function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
