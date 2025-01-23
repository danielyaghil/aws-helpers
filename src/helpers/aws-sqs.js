const {
    SQSClient,
    DeleteMessageCommand,
    ReceiveMessageCommand,
    SendMessageCommand,
    PurgeQueueCommand,
    GetQueueAttributesCommand,
    ChangeMessageVisibilityCommand // Added import
} = require('@aws-sdk/client-sqs');
const AWSBase = require('./aws-base');

class AWSSqs extends AWSBase {
    constructor(region) {
        super(SQSClient, region);
    }

    static instance(region) {
        return super.instance(AWSSqs, region);
    }

    async getQueueAttributes(queueUrl, attributeName) {
        const command = new GetQueueAttributesCommand({
            QueueUrl: queueUrl,
            AttributeNames: attributeName ? [attributeName] : ['All']
        });

        const data = await this.applyCommand(command);
        if (data && data.$metadata.httpStatusCode == 200) {
            return data.Attributes;
        }
        return null;
    }

    async getVisibleMessagesCount(queueUrl) {
        const attributes = await this.getQueueAttributes(queueUrl, 'ApproximateNumberOfMessages');
        return attributes ? attributes.ApproximateNumberOfMessages : 0;
    }

    async getNonVisibleMessagesCount(queueUrl) {
        const attributes = await this.getQueueAttributes(queueUrl, 'ApproximateNumberOfMessagesNotVisible');
        return attributes ? attributes.ApproximateNumberOfMessagesNotVisible : 0;
    }

    async getDelayedMessagesCount(queueUrl) {
        const attributes = await this.getQueueAttributes(queueUrl, 'ApproximateNumberOfMessagesDelayed');
        return attributes ? attributes.ApproximateNumberOfMessagesDelayed : 0;
    }

    async sendMessage(queueUrl, json, options) {
        const command = new SendMessageCommand({
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(json),
            DelaySeconds: options && options.delay ? options.delay : 0
        });

        const data = await this.applyCommand(command);
        if (data && data.$metadata.httpStatusCode == 200) {
            return true;
        }
        return false;
    }

    async #receiveInternal(queueUrl, maxMessages) {
        const command = new ReceiveMessageCommand({
            QueueUrl: queueUrl,
            MaxNumberOfMessages: maxMessages,
            MessageSystemAttributeNames: [
                'ApproximateReceiveCount',
                'ApproximateFirstReceiveTimestamp',
                'SentTimestamp'
            ]
        });

        const data = await this.applyCommand(command);
        if (data && data.$metadata.httpStatusCode == 200) {
            if (data.Messages) {
                const output = [];
                for (let i = 0; i < data.Messages.length; i++) {
                    const outputItem = {
                        receiptHandle: data.Messages[0].ReceiptHandle,
                        body: JSON.parse(data.Messages[0].Body),
                        receivedCount: data.Messages[0].Attributes.ApproximateReceiveCount,
                        receivedFirstTimestamp: data.Messages[0].Attributes.ApproximateFirstReceiveTimestamp
                    };
                    output.push(outputItem);
                }
                return output;
            }
        }
        return null;
    }

    async receiveMessage(queueUrl) {
        const output = await this.#receiveInternal(queueUrl, 1);
        return output ? output[0] : null;
    }

    async receiveMessages(queueUrl, maxMessages = 10) {
        return this.#receiveInternal(queueUrl, maxMessages);
    }

    async changeMessageVisibility(queueUrl, receiptHandle, visibilityTimeout) {
        const command = new ChangeMessageVisibilityCommand({
            QueueUrl: queueUrl,
            ReceiptHandle: receiptHandle,
            VisibilityTimeout: visibilityTimeout
        });

        const data = await this.applyCommand(command);
        if (data && data.$metadata.httpStatusCode == 200) {
            return true;
        }
        return false;
    }

    async deleteMessage(queueUrl, receiptHandle) {
        const command = new DeleteMessageCommand({
            QueueUrl: queueUrl,
            ReceiptHandle: receiptHandle
        });

        const data = await this.applyCommand(command);
        if (data && data.$metadata.httpStatusCode == 200) {
            return true;
        }
        return false;
    }

    async purgeQueue(queueUrl) {
        const command = new PurgeQueueCommand({
            QueueUrl: queueUrl
        });

        const data = await this.applyCommand(command);
        if (data && data.$metadata.httpStatusCode == 200) {
            return true;
        }
        return false;
    }
}

module.exports = AWSSqs;
