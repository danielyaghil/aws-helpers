const {
    ECSClient,
    RunTaskCommand,
    StopTaskCommand,
    ListTasksCommand,
    DescribeTasksCommand
} = require('@aws-sdk/client-ecs');
const AWSBase = require('./aws-base');

class AWSEcs extends AWSBase {
    constructor(region) {
        super(ECSClient, region);
    }

    static instance(region) {
        return super.instance(AWSEcs, region);
    }

    async startFargateTask(cluster, taskDefinition, subnets, securityGroups, assignPublicIp, startedBy) {
        const params = {
            cluster: cluster,
            taskDefinition: taskDefinition,
            startedBy: startedBy,
            launchType: 'FARGATE',
            networkConfiguration: {
                awsvpcConfiguration: {
                    subnets: subnets,
                    securityGroups: securityGroups,
                    assignPublicIp: assignPublicIp ? 'ENABLED' : 'DISABLED'
                }
            }
        };

        const cmd = new RunTaskCommand(params);
        let data = await this.applyCommand(cmd);
        if (data && data.$metadata.httpStatusCode == 200) {
            return data.tasks;
        }
        return null;
    }

    async stopFargateTask(cluster, taskArn) {
        const params = {
            cluster: cluster,
            task: taskArn
        };
        const cmd = new StopTaskCommand(params);
        let data = await this.applyCommand(cmd);
        if (data && data.$metadata.httpStatusCode == 200 && data.task) {
            return true;
        }
        return false;
    }

    async listTasks(cluster, family) {
        const params = {
            cluster: cluster,
            family: family
        };
        const cmd = new ListTasksCommand(params);
        let data = await this.applyCommand(cmd);
        if (data && data.$metadata.httpStatusCode == 200) {
            return data.taskArns;
        }
        return [];
    }

    async describeTask(cluster, taskArn) {
        const params = {
            cluster: cluster,
            tasks: [taskArn]
        };
        const cmd = new DescribeTasksCommand(params);
        let data = await this.applyCommand(cmd);
        if (data && data.$metadata.httpStatusCode == 200 && data.tasks && data.tasks.length > 0) {
            const task = data.tasks[0];
            if (task.attachments && task.attachments.length > 0) {
                const elasticNetworkInterface = task.attachments.find(
                    (attachment) => attachment.type === 'ElasticNetworkInterface'
                );
                if (elasticNetworkInterface && elasticNetworkInterface.details) {
                    const details = elasticNetworkInterface.details;
                    const privateIp = details.find((detail) => detail.name === 'privateIPv4Address');
                    if (privateIp) task.privateIp = privateIp.value;
                }
            }
            return task;
        }
        return null;
    }
}

module.exports = AWSEcs;
module.exports = AWSEcs;
