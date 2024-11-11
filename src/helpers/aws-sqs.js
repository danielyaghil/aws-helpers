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

    async sendMessage(queueUrl, json) {
        const command = new SendMessageCommand({
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(json)
        });

        const data = await this.applyCommand(command);
        if (data && data.$metadata.httpStatusCode == 200) {
            return true;
        }
        return false;
    }

    async receiveMessage(queueUrl) {
        const command = new ReceiveMessageCommand({
            QueueUrl: queueUrl
        });

        const data = await this.applyCommand(command);
        if (data && data.$metadata.httpStatusCode == 200) {
            if (data.Messages && data.Messages.length > 0) {
                const output = {
                    receiptHandle: data.Messages[0].ReceiptHandle,
                    message: JSON.parse(data.Messages[0].Body)
                };
                return output;
            }
        }
        return null;
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
