import { DynamoDBStreamEvent, DynamoDBStreamHandler } from 'aws-lambda'
import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import * as elasticsearch from 'elasticsearch'
import * as httpAwsEs from 'http-aws-es'

const logger = createLogger('ElasticSearchSyncFunction')
const esHost = process.env.ES_ENDPOINT

const es = new elasticsearch.Client({
  hosts: [ esHost ],
  connectionClass: httpAwsEs
})

export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
  logger.info('Processing events batch from DynamoDB', JSON.stringify(event))

  for (const record of event.Records) {
    logger.info('Processing record', JSON.stringify(record))
    if (record.eventName !== 'INSERT') {
      continue
    }

    const newItem = record.dynamodb.NewImage

    const todoId = newItem.todoId.S
    logger.info('newItem', newItem)
    const body = {
      userId: newItem.userId.S,
      todoId: newItem.todoId.S,
      createdAt: newItem.createdAt.S,
      name: newItem.name.S,
      dueDate: newItem.dueDate.S,
      done: newItem.done.S,
    }

    await es.index({
      index: 'images-index',
      type: 'images',
      id: todoId,
      body
    })

  }
}
