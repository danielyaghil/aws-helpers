// This sample demonstrates how to use the SnsClient class
// It requires AWS account with sns access and a SNS topic ARN
// Run: npm run sample-secrets

require('dotenv').config({ path: '.env', debug: true });
const { SnsClient } = require('@danielyaghil/aws-helpers');
//const { SnsClient } = require('../src/index');

const topicArn = 'arn:aws:sns:us-east-2:541633691396:aws-helpers-sample';

async function main() {
  const snsClient = SnsClient.instance();

  const obj = {
    foo: 'bar',
  };

  const result = await snsClient.publish(topicArn, obj);
  console.log(`Sns publish: ${result}`);
}

main();
