// This sample demonstrates how to use the CognitoClient class
// It requires AWS account with cognito access and a user pool with user and groups
// In the sample below override th variable userPoolId with your user pool id
// Run: npm run sample-cognito

require('dotenv').config({ path: '.env', debug: true });
const { CognitoClient } = require('@danielyaghil/aws-helpers');
//const { CognitoClient } = require('../src/index.js');

async function main() {
  console.log(
    `${process.env.AWS_REGION} ${process.env.AWS_ACCESS_KEY_ID} ${process.env.AWS_SECRET_ACCESS_KEY}`
  );

  const userPoolId = 'us-east-2_P6fKrooXL';

  const cognitoClient = CognitoClient.instance();

  const groups = await cognitoClient.getAllGroups(userPoolId);
  console.log(`Groups: ${JSON.stringify(groups)}`);

  console.log('=======================');

  const users = await cognitoClient.getUsersInGroup(
    userPoolId,
    groups[0].GroupName
  );
  console.log(
    `Users in group "${groups[0].GroupName}": ${JSON.stringify(users)}`
  );
}

main();
