// This sample demonstrates how to use the SecretsClient class
// It requires AWS account with secrets access and a secret named sample/aws-helpers to be created
// Run: npm run sample-secrets

require('dotenv').config({ path: '.env', debug: true });
const { SecretsClient } = require('@danielyaghil/aws-helpers');
//const { SecretsClient } = require('../src/index');

const secretKey = 'sample/aws-helpers';

async function main() {
  const secretClient = SecretsClient.instance();

  const data = await secretClient.get(secretKey);
  console.log(`Secret: ${JSON.stringify(data)}`);
}

main();
