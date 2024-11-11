// This sample demonstrates how to use the SnsClient class
// It requires AWS account with sns access and a SNS topic ARN
// Run: npm run sample-sns

require('dotenv').config({ path: '.env', debug: true });
//const { SqsClient } = require('@danielyaghil/aws-helpers');
const { SqsClient } = require('../src/index');

const queueUrl = 'https://sqs.eu-west-1.amazonaws.com/750019508495/TestRunner';

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function main() {
  const sqsClient = SqsClient.instance();

  const obj = {
    foo: 'bar',
  };

  let result = await sqsClient.sendMessage(queueUrl, obj);
  console.log(`Sqs sendMessage: ${result}`);

  obj.foo = 'bar2';
  result = await sqsClient.sendMessage(queueUrl, obj);
  console.log(`Sqs sendMessage: ${result}`);

  obj.foo = 'bar3';
  result = await sqsClient.sendMessage(queueUrl, obj);
  console.log(`Sqs sendMessage: ${result}`);

  obj.foo = 'bar4';
  result = await sqsClient.sendMessage(queueUrl, obj);
  console.log(`Sqs sendMessage: ${result}`);

  await sleep(1000);

  result = await sqsClient.getVisibleMessagesCount(queueUrl);
  console.log(`Sqs getVisibleMessagesCount: ${result}`);

  result = await sqsClient.getNonVisibleMessagesCount(queueUrl);
  console.log(`Sqs getNonVisibleMessagesCount: ${result}`);

  result = await sqsClient.getDelayedMessagesCount(queueUrl);
  console.log(`Sqs getDelayedMessagesCount: ${result}`);

  let message = await sqsClient.receiveMessage(queueUrl);
  console.log(`Sqs receiveMessage: ${JSON.stringify(message)}`);

  await sleep(3000);

  result = await sqsClient.getVisibleMessagesCount(queueUrl);
  console.log(`Sqs getVisibleMessagesCount after receive: ${result}`);

  result = await sqsClient.getNonVisibleMessagesCount(queueUrl);
  console.log(`Sqs getNonVisibleMessagesCount after receive: ${result}`);

  if (message) {
    result = await sqsClient.deleteMessage(queueUrl, message.receiptHandle);
    console.log(`Sqs deleteMessage: ${result}`);

    await sleep(3000);

    result = await sqsClient.getVisibleMessagesCount(queueUrl);
    console.log(`Sqs getVisibleMessagesCount after delete: ${result}`);

    result = await sqsClient.getNonVisibleMessagesCount(queueUrl);
    console.log(`Sqs getNonVisibleMessagesCount after delete: ${result}`);
  }

  result = await sqsClient.purgeQueue(queueUrl);
  console.log(`Sqs purgeQueue: ${result}`);

  await sleep(3000);

  result = await sqsClient.getVisibleMessagesCount(queueUrl);
  console.log(`Sqs getVisibleMessagesCount after purge: ${result}`);

  result = await sqsClient.getNonVisibleMessagesCount(queueUrl);
  console.log(`Sqs getNonVisibleMessagesCount after purge: ${result}`);

  message = await sqsClient.receiveMessage(queueUrl);
  console.log(`Sqs receiveMessage null: ${message == null}`);
}

main();
