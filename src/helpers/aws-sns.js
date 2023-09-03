const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const AWSBase = require('./aws-base');

class AWSSns extends AWSBase {
    constructor(region) {
        super(SNSClient, region);
    }

    static instance(region) {
        return super.instance(AWSSns, region);
    }

    async publish(topicArn, json) {
        const command = new PublishCommand({
            TopicArn: topicArn,
            Message: JSON.stringify(json)
        });

        const data = await this.applyCommand(command);
        if (data && data.$metadata.httpStatusCode == 200) {
            return true;
        }
        return false;
    }
}

module.exports = AWSSns;
