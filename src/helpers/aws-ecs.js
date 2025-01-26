const { ECSClient, RunTaskCommand } = require('@aws-sdk/client-ecs');
const AWSBase = require('./aws-base');

class AWSEcs extends AWSBase {
    constructor(region) {
        super(ECSClient, region);
    }

    static instance(region) {
        return super.instance(AWSEcs, region);
    }

    async runFargateTask(cluster, taskDefinition, subnets, securityGroups, assignPublicIp, startedBy) {
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
}

module.exports = AWSEcs;
