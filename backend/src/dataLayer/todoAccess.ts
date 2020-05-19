import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { Client } from 'elasticsearch'

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly s3BucketName = process.env.IMAGES_S3_BUCKET,
    private readonly todoTable = process.env.TODO_TABLE,
    private readonly todoIndex = process.env.TODO_ID_INDEX,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION,
    private readonly es = Client
    ) {
  }

  async getAllTodoItems(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient.query({
      TableName: this.todoTable,
      IndexName: this.todoIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })
    .promise()

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

  async updateTodoAttachment(userId: string, todoId: string, attachmentUrl?: string): Promise<void> {    
    const params = {
      TableName: this.todoTable,
      Key: {
        "userId": userId,
        "todoId": todoId
      },
      UpdateExpression: "set #at = :attachmentUrl",
      ExpressionAttributeValues: {        
        ":attachmentUrl": attachmentUrl
      },
      ExpressionAttributeNames: {        
        "#at": "attachmentUrl"
      },
      ReturnValues: "NONE"
    }
    await this.docClient.update(params).promise()   
  }

  async deleteToDo(todoId:string, userId:string): Promise<string> {
    const params = {
      TableName: this.todoTable,
      Key: {
        userId: userId,
        todoId: todoId
      }
    }
    const result = await this.docClient.delete(
      params
    ).promise()
    console.log(result)
    return ''
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

  async searchToDo(query:string,userId:String):Promise<any> {
    console.log("im in todo access")
    const params = {
      multi_match: {
        query: query + " " + userId,
        type: "cross_fields",
        fields: ["todoTitle","userid"],
        operator:   "and"
      }
    }
  
    return await this.es.search({
      index: 'images-index',
      type: 'images',
      body:{
        "query": params
      }
    })
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }
  return new XAWS.DynamoDB.DocumentClient()
}
