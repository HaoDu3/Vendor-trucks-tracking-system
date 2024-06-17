import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

AWS.config.update({region: process.env.AWS_REGION});

const { DynamoDB, SQS} = AWS;

const dynamodb = new DynamoDB();
const sqs = new SQS();

// describe a table
export const dynamodbDescribeTable = async (tableName: string) => {
    try {
        const table = await dynamodb.describeTable({
            TableName: tableName
        }).promise();
        console.log('Table retrieved', table);
        return table;
    } catch(e) {
        if (e instanceof Error) {
            throw e
        }
        throw new Error(`dynamodbDescribeTable error object unknown type`);
    }
}

export const dynamodbScanTable = async function* (tableName: string, limit: number = 25, lastEvaluatedKey?: AWS.DynamoDB.Key) {
    while (true) {
        const params: AWS.DynamoDB.ScanInput = {
            "TableName": tableName,
            "Limit": limit,
        }

        if (lastEvaluatedKey) {
            params.ExclusiveStartKey = lastEvaluatedKey
        }

        try {
            const result = await dynamodb.scan(params).promise();
            if (!result.Count) {
                return;
            }

            lastEvaluatedKey = (result as AWS.DynamoDB.ScanOutput).LastEvaluatedKey;
            result.Items = result.Items?.map((item) => unmarshall(item));
            yield result;
        } catch(e) {
            if (e instanceof Error) {
                throw e;
            }
            throw new Error('dynamodbScanTable unexpected error')
        }
    }
}

export const getAllScanResults = async <T>(tableName: string, limit: number = 25) => {
    try {
        await dynamodbDescribeTable(tableName);

        const scanTableGen = await dynamodbScanTable(tableName, limit);

        const results: T[] = [];
        let isDone = false;

        while (!isDone) {
            const iterator = await scanTableGen.next();

            if (!iterator) {
                throw new Error('No iterator returned');
            }

            if (iterator.done || !iterator.value.LastEvaluatedKey) {
                isDone = true;
            }

            if (iterator.value) {
                iterator.value.Items!.forEach((result:any) => results.push(result));
            }
        }

        return results;
    } catch(e) {
        if (e instanceof Error) {
            throw e;
        }

        throw new Error(`getAllScanResults unexpected error`);
    }
}

export const dynamoDbAddConnection = async (tableName: string, connectionId: string) => {
    try {
        const params: AWS.DynamoDB.PutItemInput = {
            TableName: tableName,
            Item: marshall({connectionId})
        };

        const res = await dynamodb.putItem(params).promise();

        return res;
    } catch(e) {
        if (e instanceof Error) {
            return e;
        }
        return new Error('dynamoDbAddConnection error object unkown type');
    }
}

export const dynamoDbRemoveConnection = async (tableName: string, connectionId: string) => {
    try {
        const params: AWS.DynamoDB.DeleteItemInput = {
            TableName: tableName,
            Key: {
                'connectionId': marshall(connectionId)
            }
        };

        const res = await dynamodb.deleteItem(params).promise();

        return res;
    } catch(e) {
        if (e instanceof Error) {
            return e;
        }
        return new Error('dynamoDbRemoveConnection error object unkown type');
    }
}

export const sqsDeleteMessage = async (queueUrl: string, receiptHandle: string) => {
    try {
        const params: AWS.SQS.DeleteMessageRequest = {
            ReceiptHandle: receiptHandle,
            QueueUrl: queueUrl
        }

        const res = await sqs.deleteMessage(params).promise();
        console.log('Message deleted!');
        return res;
    } catch(e) {
        if (e instanceof Error) {
            return e;
        }

        return new Error (`sqsDeleteMessage error object unknown type`);
    }
}

interface BroadcastMessageWebsocketProps {
    apiGateway: AWS.ApiGatewayManagementApi,
    connections: any[],
    message: string,
    tableName: string,
}

export const broadcastMessageWebsocket = async (props: BroadcastMessageWebsocketProps) => {
    const { apiGateway, connections, message, tableName } = props;
    const sendVendorsCall = connections?.map(async connection => {
        const { connectionId } = connection;
        try { 
            await apiGateway.postToConnection({ ConnectionId: connectionId, Data: message}).promise();
        } catch(e) {
            if ((e as any).statusCode === 410) {
                console.log(`delete stale connection: ${connectionId}`);
                const removeConnRes = await dynamoDbRemoveConnection(tableName, connectionId);
                if (removeConnRes instanceof Error) {
                    return e;
                }
            } else {
                return e;
            }
        }
    })

    try {
        const res = await Promise.all(sendVendorsCall);
        return res;
    } catch(e) {
        if (e instanceof Error) {
            return e;
        }
        return new Error(`broadcastMessageWebsocket error object unknown type`)
    }
}