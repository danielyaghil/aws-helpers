require('dotenv').config({ path: './.env', debug: true });
//const { S3Client } = require('@danielyaghil/aws-helpers');
const { S3Client } = require('../src/index');

async function main() {
  const s3Client = S3Client.instance();

  //put a text
  const data = await s3Client.put(
    'aws-helpers-sample',
    'sample.txt',
    'private',
    'my sample text'
  );
  console.log(`Text of aws-helper-sample/sample.txt: ${data}`);

  //retrieve text
  const content = await s3Client.get('aws-helpers-sample', 'sample.txt');
  console.log('Text of aws-helper-sample/sample.txt:' + content);
}

main();
