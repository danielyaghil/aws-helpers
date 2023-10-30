const { S3Client } = require('@danielyaghil/aws-helpers');

async function main() {
    const s3Client = S3Client.instance();

    const data = await s3Client.get('aws-helper-sample', 'sample.txt', 'txt');
    console.log(`Text of aws-helper-sample/sample.txt: ${data}`);

    const body = await s3Client.get('aws-helper-sample', 'sample.txt');
    console.log('Body (stream) of aws-helper-sample/sample.txt:' + body);
}

main();
