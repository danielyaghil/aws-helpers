// this sample demonstrates how to use the EcsClient class to put and get files from s3
// It requires AWS account with s3 access and a bucket named aws-helpers-sample to be created
// Run: npm run sample-s3

require('dotenv').config({ path: './.env', debug: true });
//const { EcsClient } = require('@danielyaghil/aws-helpers');
const { EcsClient } = require('../src/index');

async function main() {
  const sample = {
    cluster: 'arn:aws:ecs:eu-west-1:<account>>:cluster/<sample-cluster>',
    taskDefinition:
      'arn:aws:ecs:eu-west-1:<account>:task-definition/<sample-task>',
    subnets: ['subnet-id-1', 'subnet-id-2', 'subnet-id-3'],
    securityGroups: ['sg-id-1'],
    assignPublicIp: true,
    startedBy: 'sample-starter',
  };

  const ecsClient = EcsClient.instance();

  const tasks = await ecsClient.runFargateTask(
    sample.cluster,
    sample.taskDefinition,
    sample.subnets,
    sample.securityGroups,
    sample.assignPublicIp,
    sample.startedBy
  );
  console.log('Tasks:', tasks);
}

main();
