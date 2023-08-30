// index.js
const AWSSecrets = require('./src/aws-secrets');
const AWSS3 = require('./src/aws-s3');
const AWSDynamo = require('./src/aws-dynamo-db');
const AWSCognito = require('./src/aws-cognito');

module.exports.SecretsClient = AWSSecrets;
module.exports.S3Client = AWSS3;
module.exports.DynamoDbClient = AWSDynamo;
module.exports.CognitoClient = AWSCognito;
