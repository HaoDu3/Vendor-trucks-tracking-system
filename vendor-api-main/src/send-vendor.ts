import { APIGatewayProxyResult, SQSEvent } from "aws-lambda";
import AWS from "aws-sdk";
import { broadcastMessageWebsocket, getAllScanResults, sqsDeleteMessage } from "./aws";

export const handler = async (event: SQSEvent): Promise<APIGatewayProxyResult> => {
    const tableName = process.env.AWS_TABLE_NAME ?? 'websocket-connections';
    const sqsUrl = process.env.AWS_SQS_URL ?? 'https://sqs.us-east-1.amazonaws.com/567192499845/vendor-twitter-queue';
    const websocketUrl = process.env.AWS_WEBSOCKET_URL ?? '';
    
    const endpoint = new URL(websocketUrl);
    const apigwManagementApi = new AWS.ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: endpoint.hostname + endpoint.pathname
    })

    const message = event.Records[0].body;

    if (!message) {
        return {
            statusCode: 500,
            headers: {
                "content-type": "text/plain; charset=utf-8"
            },
            body: 'event message empty or null'
        }
    }

    const dbRes = await getAllScanResults<{ connectionId: string }>(tableName);
    if (dbRes instanceof Error) {
        return {
            statusCode: 500,
            headers: {
                "content-type": "text/plain; charset=utf-8"
            },
            body: dbRes.message
        }
    }

    const broadcastRes = await broadcastMessageWebsocket({
        apiGateway: apigwManagementApi,
        connections: dbRes,
        message,
        tableName
    })
    if (broadcastRes instanceof Error) {
        return {
            statusCode: 500,
            headers: {
                "content-type": "text/plain; charset=utf-8"
            },
            body: broadcastRes.message
        }
    }

    console.log(`sent message ${message} to ${dbRes.length} users!`)

    await sqsDeleteMessage(sqsUrl, event.Records[0].receiptHandle);

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: `sent message ${message} to ${dbRes.length} users!`,
        })
    }
}
