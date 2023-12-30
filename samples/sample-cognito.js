// This sample demonstrates how to use the CognitoClient class
// It requires AWS account with cognito access and a user pool with user and groups
// In the sample below override th variable userPoolId with your user pool id
// Run: npm run sample-cognito

require('dotenv').config({ path: '.env', debug: true });
//const { CognitoClient } = require('@danielyaghil/aws-helpers');
const { CognitoClient } = require('../src/index.js');

async function main() {
  console.log(
    `${process.env.AWS_REGION} ${process.env.AWS_ACCESS_KEY_ID} ${process.env.AWS_SECRET_ACCESS_KEY}`
  );

  const userPoolId = process.env.COGNITO_USER_POOL_ID;

  const cognitoClient = CognitoClient.instance();

  console.log('========= ADMIN ==============');

  const groups = await cognitoClient.getAllGroups(userPoolId);
  console.log(`Groups: ${JSON.stringify(groups)}`);

  console.log('====');

  const users = await cognitoClient.getUsersInGroup(
    userPoolId,
    groups[0].GroupName
  );
  console.log(
    `Users in group "${groups[0].GroupName}": ${JSON.stringify(users)}`
  );

  console.log('========= TOKEN ==============');

  const token = await cognitoClient.getTokenFromClientCredentials(
    process.env.COGNITO_CLIENT_ID,
    process.env.COGNITO_CLIENT_SECRET,
    process.env.COGNITO_SCOPE,
    process.env.COGNITO_BASE_URL
  );
  console.log(`Token from Client Credentials: ${JSON.stringify(token)}`);

  console.log('====');

  const payload = await cognitoClient.verify(
    process.env.COGNITO_USER_POOL_ID,
    process.env.COGNITO_CLIENT_ID,
    token.access_token,
    'access'
  );
  console.log(`Payload: ${JSON.stringify(payload)}`);
}

main();
