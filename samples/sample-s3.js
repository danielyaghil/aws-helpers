// this sample demonstrates how to use the S3Client class to put and get files from s3
// It requires AWS account with s3 access and a bucket named aws-helpers-sample to be created
// Run: npm run sample-s3

require('dotenv').config({ path: './.env', debug: true });
const fs = require('fs');
const axios = require('axios');
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

  //retrive with signed URL and download
  const url = await s3Client.getSignedUrl(
    'aws-helpers-sample',
    'sample-from-file.txt',
    60
  );
  if (!url) {
    console.error('Error getting signed url');
    return;
  } else {
    console.log(
      'Signed URL for aws-helpers-sample/sample-from-file.txt:' + url
    );
    // Download the file using axios
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });

    const writer = fs.createWriteStream('./downloads/file.txt');

    response.data.pipe(writer);

    const promise = new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    await promise.then(() => {
      console.log('File downloaded successfully');
    });
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

  //put as text ina folder
  success = await s3Client.put(
    'aws-helpers-sample',
    'folder/sample-from-text.txt',
    'private',
    'Example text to be saved in s3'
  );
  if (!success) {
    console.error('Error writing text to s3');
    return;
  } else {
    console.log(
      `Put aws-helpers-sample/folder/sample-from-text.txt success: ${success}`
    );
  }

  //list ListObjectsV2Command
  let list = await s3Client.list('aws-helpers-sample');
  if (!list) {
    console.error('Error listing objects from s3');
    return;
  } else {
    console.log('List of objects in aws-helpers-sample bucket:');
    list.forEach((element) => {
      console.log(`- ${element.Key}`);
    });
  }

  list = await s3Client.list('aws-helpers-sample', 'folder');
  if (!list) {
    console.error('Error listing objects from s3');
    return;
  } else {
    console.log('List of objects in aws-helpers-sample/folder:');
    list.forEach((element) => {
      console.log(`- ${element.Key}`);
    });
  }

  list = await s3Client.list('aws-helpers-sample', '', '', 2);
  if (!list) {
    console.error('Error listing objects from s3');
    return;
  } else {
    console.log('List of objects in aws-helpers-sample with max 2:');
    list.forEach((element) => {
      console.log(`- ${element.Key}`);
    });
  }

  list = await s3Client.list('aws-helpers-sample', '', 'sample-from-file.txt');
  if (!list) {
    console.error('Error listing objects from s3');
    return;
  } else {
    console.log(
      'List of objects in aws-helpers-sample with start key "sample-from-file.txt":'
    );
    list.forEach((element) => {
      console.log(`- ${element.Key}`);
    });
  }

  //remove object
  success = await s3Client.delete('aws-helpers-sample', 'sample-from-text.txt');
  if (!success) {
    console.error('Error deleting object from s3');
    return;
  } else {
    console.log(
      `Delete aws-helpers-sample/sample-from-text.txt success: ${success}`
    );
  }

  //remove folder
  success = await s3Client.delete('aws-helpers-sample', 'folder');
  if (!success) {
    console.error('Error deleting folder from s3');
    return;
  } else {
    console.log(`Delete aws-helpers-sample/folder success: ${success}`);
  }
}

main();
