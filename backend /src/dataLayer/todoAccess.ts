import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly s3BucketName = process.env.IMAGES_S3_BUCKET,
    private readonly todoTable = process.env.TODO_TABLE,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
    ) {
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

  async getTodoItem(todoId: string, userId: string) {
    const result = await this.docClient
      .get({
        TableName: this.todoTable,
        Key: {
          todoId,
          userId
        }
      })
      .promise()

    return result.Item
  }

  async generateUploadUrl(imageId: string): Promise<string> {
    const url = s3.getSignedUrl('putObject', {
      Bucket: this.s3BucketName,
      Key: imageId,
      Expires: this.urlExpiration
    })

    return url as string
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

  async updateTodoItem(updatedTodo: TodoUpdate, userId: string, todoId: string,): Promise<void> { await this.docClient.update({
    TableName: this.todoTable,
    Key: {
      todoId,
      userId
    },
    ExpressionAttributeNames: {
      '#nameAttr': 'name'
    },
    UpdateExpression: 'SET #nameAttr = :name, dueDate = :dueDate, done = :done',
    ExpressionAttributeValues: {
      ':name': updatedTodo.name,
      ':dueDate': updatedTodo.dueDate,
      ':done': updatedTodo.done
    }
  }).promise()
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
