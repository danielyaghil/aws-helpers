require('dotenv').config({ path: '.env', debug: true });
const { SecretsClient } = require('@danielyaghil/aws-helpers');

async function main() {
  console.log(
    `${process.env.AWS_REGION} ${process.env.AWS_ACCESS_KEY_ID} ${process.env.AWS_SECRET_ACCESS_KEY}`
  );

  const secretClient = SecretsClient.instance();

  const data = await secretClient.get('sample/aws-helpers');
  console.log(`Secret: ${JSON.stringify(data)}`);
}

main();
