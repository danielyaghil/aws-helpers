// this sample demonstrates how to use the S3Client class to put and get files from s3
// It requires AWS account with s3 access and a bucket named aws-helpers-sample to be created

require('dotenv').config({ path: './.env', debug: true });
var fs = require('fs');
//const { S3Client } = require('@danielyaghil/aws-helpers');
const { S3Client } = require('../src/index');

async function main() {
  const s3Client = S3Client.instance();

  //put a stream
  let stream = fs.createReadStream('assets/sample.txt');
  let success = await s3Client.put(
    'aws-helpers-sample',
    'sample-from-file.txt',
    'private',
    stream
  );
  if (!success) {
    console.error('Error writing stream to s3');
    return;
  } else {
    console.log(
      `Put aws-helpers-sample/sample-from-file.txt success: ${success}`
    );
  }

  //retrieve as stream
  const receiveStream = await s3Client.get(
    'aws-helpers-sample',
    'sample-from-file.txt'
  );
  if (!receiveStream) {
    console.error('Error retrieving data stream from s3');
    return;
  } else {
    const contentFromStream = await new Promise((resolve, reject) => {
      const chunks = [];
      receiveStream.on('data', (chunk) => chunks.push(chunk));
      receiveStream.on('error', reject);
      receiveStream.on('end', () =>
        resolve(Buffer.concat(chunks).toString('utf8'))
      );
    });
    console.log(
      'Text of aws-helpers-sample/sample-from-file.txt as stream:' +
        contentFromStream
    );
  }

  //retrieve as text
  let content = await s3Client.get(
    'aws-helpers-sample',
    'sample-from-file.txt',
    'txt'
  );
  if (!content) {
    console.error('Error retrieving data from s3');
    return;
  } else {
    console.log(
      'Text of aws-helpers-sample/sample-from-file.txt s text:' + content
    );
  }

  //put a text
  success = await s3Client.put(
    'aws-helpers-sample',
    'sample-from-text.txt',
    'private',
    'Example text to be saved in s3'
  );
  if (!success) {
    console.error('Error writing text to s3');
    return;
  } else {
    console.log(
      `Put aws-helpers-sample/sample-from-text.txt success: ${success}`
    );
  }

  //retrieve as text
  content = await s3Client.get(
    'aws-helpers-sample',
    'sample-from-text.txt',
    'text'
  );
  if (!content) {
    console.error('Error retrieving data from s3');
    return;
  } else {
    console.log(
      'Text of aws-helpers-sample/sample-from-file.txt  text:' + content
    );
  }
}

main();
